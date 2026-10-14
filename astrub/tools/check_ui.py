"""Real Chromium checks for the Astrub UI, served by npm run dev.

Run: python tools/check_ui.py
Playwright for Python and a Chromium executable are required.
"""
import json
import os
import shutil
import time
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

OUT = Path(os.getenv('ASTRUB_SCREENSHOTS', str(Path.cwd() / 'ui-checks')))
URL = os.getenv('ASTRUB_TEST_URL', 'http://127.0.0.1:5173/')
VIEWPORTS = [('desktop', 1440, 960), ('mobile', 390, 844), ('landscape', 844, 390)]
if 'ASTRUB_VIEWPORTS' in os.environ:
    selected = {value.strip() for value in os.environ['ASTRUB_VIEWPORTS'].split(',') if value.strip()}
    unknown = selected - {viewport[0] for viewport in VIEWPORTS}
    if not selected or unknown:
        raise ValueError('ASTRUB_VIEWPORTS doit contenir desktop, mobile ou landscape, séparés par des virgules.')
    VIEWPORTS = [viewport for viewport in VIEWPORTS if viewport[0] in selected]


def install_observer(page):
    # Vite timestamps modules during HMR. Reuse the actual loaded module URLs
    # instead of instantiating another Phaser game with a different URL.
    page.evaluate("""async () => {
      const resource=path=>performance.getEntriesByType('resource').filter(e=>new URL(e.name).pathname===path).at(-1)?.name||path;
      const main=resource('/src/main.js');
      window.__e2e={main:await import(main),state:await import(resource('/src/game/state.js')),iso:await import(resource('/src/game/isometric.js'))};
    }""")


def state(page):
    return page.evaluate("async () => JSON.parse(JSON.stringify((window.__e2e.state).getState()))")


def screenshot(page, name):
    page.screenshot(path=str(OUT / (name + '.png')), animations='disabled')


def active(page, scene):
    # Phaser's active flag can already be true while a scene is loading.
    page.wait_for_function("name => {const game=window.__e2e.main.game;return game.scene.isActive(name)&&game.scene.getScene(name)?.sys.settings.status===5;}", arg=scene)


def scene_value(page, expression):
    return page.evaluate("async () => {const {game}=window.__e2e.main; const scene=game.scene.getScene('VillageScene'); return " + expression + ";}")


def camera(page):
    return scene_value(page, "[scene.cameras.main.scrollX,scene.cameras.main.scrollY,scene.cameras.main.zoom]")


def floor_point(page, building_id):
    return page.evaluate("""async id => {
      const {game}=window.__e2e.main;
      const {getState,BUILDINGS}=window.__e2e.state;
      const {xy}=window.__e2e.iso;
      const b=getState().buildings.find(b=>b.id===id), [w,h]=BUILDINGS[b.type].size;
      const world=xy(b.x+Math.floor(w/2),b.y+Math.floor(h/2));
      const camera=game.scene.getScene('VillageScene').cameras.main;
      const p=camera.matrix.transformPoint(world.x-camera.scrollX,world.y-camera.scrollY);
      return {x:p.x,y:p.y,tag:document.elementFromPoint(p.x,p.y)?.tagName};
    }""", building_id)


def click_building(page, building_id):
    # A neighbouring roof can overlap the floor of an isometric footprint.
    # Aim at opaque pixels of the target sprite and confirm the actual selection.
    candidates = page.evaluate("""id => {
      const scene=window.__e2e.main.game.scene.getScene('VillageScene');
      const image=scene.buildingObjects.find(item=>item.buildingId===id)?.image;
      if(!image)return [];
      const camera=scene.cameras.main,points=[];
      for(const fy of [.28,.4,.55,.7,.85])for(const fx of [.5,.35,.65,.2,.8]){
        const alpha=scene.textures.getPixelAlpha(Math.floor(fx*image.frame.realWidth),Math.floor(fy*image.frame.realHeight),image.texture.key,image.frame.name);
        if(alpha<18)continue;
        const p=camera.matrix.transformPoint(image.x+(fx-image.originX)*image.displayWidth-camera.scrollX,image.y+(fy-image.originY)*image.displayHeight-camera.scrollY);
        if(document.elementFromPoint(p.x,p.y)?.tagName==='CANVAS')points.push({x:p.x,y:p.y});
      }
      return points;
    }""",building_id)
    for pt in candidates:
        page.mouse.click(pt['x'],pt['y'])
        if scene_value(page,'scene.selectedId')==building_id:
            expect(page.locator('#selection-panel')).to_be_visible()
            return
    raise AssertionError(f'No reachable opaque part of building {building_id}; tried {len(candidates)} pixels')


def open_slot(page, type_name, ignore_id=None):
    return page.evaluate("""async ({type,ignoreId}) => {
      const {game}=window.__e2e.main;
      const {BUILDINGS,canBuild,canMove,getState}=window.__e2e.state;
      const {xy}=window.__e2e.iso;
      const cam=game.scene.getScene('VillageScene').cameras.main;
      const [w,h]=BUILDINGS[type].size;
      const old=ignoreId===null?null:getState().buildings.find(b=>b.id===ignoreId);
      const slots=[];
      for(let x=12;x<29;x++)for(let y=12;y<29;y++){
        if(old&&x===old.x&&y===old.y)continue;
        if(!(ignoreId===null?canBuild(type,x,y):canMove(ignoreId,x,y)))continue;
        const pos=xy(x+Math.floor(w/2),y+Math.floor(h/2));
        const pt=cam.matrix.transformPoint(pos.x-cam.scrollX,pos.y-cam.scrollY);
        if(pt.x<25||pt.y<130||pt.x>innerWidth-25||pt.y>innerHeight-140)continue;
        if(document.elementFromPoint(pt.x,pt.y)?.tagName!=='CANVAS')continue;
        slots.push({x,y,sx:pt.x,sy:pt.y,d:Math.hypot(x-20,y-20)});
      }
      return slots.sort((a,b)=>a.d-b.d)[0];
    }""", {'type':type_name,'ignoreId':ignore_id})


def assert_in_view(page, selector):
    box = page.locator(selector).bounding_box()
    assert box, f'{selector}: no visible box'
    vp = page.viewport_size
    assert box['x'] >= -1 and box['y'] >= -1 and box['x'] + box['width'] <= vp['width'] + 1 and box['y'] + box['height'] <= vp['height'] + 1, f'{selector} leaves viewport: {box}, {vp}'


def assert_button_art(page, selector):
    """Decorative graphics must let the real DOM button receive the click."""
    issues = page.locator(selector).evaluate_all("""buttons => buttons.flatMap(button => {
      const issues=[];
      for(const label of ['.action-label','.build-name','.build-filter-copy','.train-label','.guide-action-label']){
        if(button.querySelectorAll(label).length>1)issues.push('Functional label rendered more than once: '+button.id+' '+label);
      }
      for(const art of button.querySelectorAll('.ui-art,.ui-icon')){
        if(!art.closest('[aria-hidden="true"]'))issues.push('Illustration exposed to assistive technologies: '+button.id);
        if(getComputedStyle(art).pointerEvents!=='none')issues.push('Illustration intercepts clicks: '+button.id+' '+art.className);
      }
      for(const part of [button,...button.querySelectorAll('.ui-art,.ui-icon')]){
        for(const pseudo of ['::before','::after']){
          const style=getComputedStyle(part,pseudo);
          if(!['none','normal',''].includes(style.content)&&(style.backgroundImage+style.borderImageSource).includes('url(')&&style.pointerEvents!=='none')issues.push('Illustrated pseudo-element intercepts clicks: '+button.id+' '+pseudo);
        }
      }
      if(!button.getClientRects().length)return issues;
      const rect=button.getBoundingClientRect(),x=rect.x+rect.width/2,y=rect.y+rect.height/2;
      if(x<0||y<0||x>=innerWidth||y>=innerHeight)return issues;
      for(let parent=button.parentElement;parent;parent=parent.parentElement){
        const style=getComputedStyle(parent);
        if(/auto|scroll|hidden|clip/.test(style.overflow+style.overflowX+style.overflowY)){
          const clip=parent.getBoundingClientRect();
          if(x<clip.left||x>clip.right||y<clip.top||y>clip.bottom)return issues;
        }
      }
      if(document.elementFromPoint(x,y)?.closest('button')!==button)issues.push('Button centre obscured: '+(button.id||button.textContent.trim()));
      return issues;
    })""")
    assert not issues, '; '.join(issues)


def assert_stable_buttons(page, selector, focus_selector=None):
    """Saving unchanged state must preserve graphic nodes and keyboard focus."""
    if focus_selector:
        page.locator(focus_selector).focus()
    page.evaluate("""selector => {
      window.__buttonCheck=[...document.querySelectorAll(selector)].map(button=>({button,nodes:[...button.querySelectorAll('*')],labelCount:button.querySelectorAll('.action-label,.build-name,.train-label,.guide-action-label').length}));
      window.__buttonReplacements=[];
      window.__buttonObserver=new MutationObserver(records=>{
        for(const record of records)if([...record.addedNodes,...record.removedNodes].some(node=>node.nodeType===Node.ELEMENT_NODE))window.__buttonReplacements.push(record.target.id||record.target.className);
      });
      for(const item of window.__buttonCheck)window.__buttonObserver.observe(item.button,{childList:true,subtree:true});
      for(let i=0;i<3;i++)window.__e2e.state.save();
    }""", selector)
    page.wait_for_timeout(1100)
    issues = page.evaluate("""() => {
      window.__buttonObserver.disconnect();
      const issues=window.__buttonCheck.flatMap(({button,nodes,labelCount})=>{
        const result=[];
        if(!button.isConnected||nodes.some(node=>!node.isConnected||!button.contains(node)))result.push('Decorative/button node replaced: '+(button.id||button.textContent.trim()));
        if(button.querySelectorAll('.action-label,.build-name,.train-label,.guide-action-label').length!==labelCount)result.push('Labels duplicated or removed: '+button.id);
        return result;
      });
      if(window.__buttonReplacements.length)issues.push('Recreated element children: '+window.__buttonReplacements.join(', '));
      return issues;
    }""")
    assert not issues, '; '.join(issues)
    if focus_selector:
        expect(page.locator(focus_selector)).to_be_focused()


def assert_resource_fill(page):
    probe = """cards => cards.flatMap(card => {
      const amount=Number(card.dataset.amount),cap=Number(card.dataset.cap);
      if(!Number.isFinite(amount)||!Number.isFinite(cap)||cap<=0)return ['Missing/invalid HUD amounts: '+card.className];
      const ratio=Math.max(0,Math.min(1,amount/cap));
      const raw=getComputedStyle(card).getPropertyValue('--fill').trim(),value=Number(raw);
      const problems=!raw||!Number.isFinite(value)||Math.abs(value-ratio)>.001?['Incorrect resource fill: '+card.className]:[];
      const meter=card.querySelector('.resource-meter'),fill=meter?.firstElementChild;
      if(!meter||!fill)return [...problems,'Missing visible resource meter: '+card.className];
      const rim=getComputedStyle(card,'::after'),windowStyle=getComputedStyle(meter);
      if(!rim.borderImageSource.includes('meter-track'))problems.push('Illustrated resource rim missing: '+card.className);
      if(Number(rim.zIndex)<=Number(windowStyle.zIndex))problems.push('Resource fill paints over its rim: '+card.className);
      if(rim.borderImageSlice.includes('fill'))problems.push('Opaque resource rim covers its fill: '+card.className);
      if(!rim.maskComposite.split(',').every(part=>part.trim()==='exclude'))problems.push('Resource opening is not excluded from rim mask: '+card.className);
      if(windowStyle.overflow!=='hidden'||windowStyle.pointerEvents!=='none'||rim.pointerEvents!=='none')problems.push('Resource fill is not clipped/decorative: '+card.className);
      if(meter&&fill&&meter.getBoundingClientRect().width>0){
        const width=fill.getBoundingClientRect().width;
        const style=getComputedStyle(meter),available=meter.getBoundingClientRect().width-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)-parseFloat(style.borderLeftWidth)-parseFloat(style.borderRightWidth);
        if(Math.abs(width-available*ratio)>.1)problems.push('Visible resource fill disagrees with amount: '+card.className);
      }
      return problems;
    })"""
    issues = page.locator('.resource').evaluate_all(probe)
    # Width transitions may get their first painted frame late on a busy CPU.
    # Wait for the real fill to settle; layer and data errors fail immediately.
    deadline = time.monotonic() + 3
    while issues and all(issue.startswith('Visible resource fill disagrees') for issue in issues) and time.monotonic() < deadline:
        page.wait_for_timeout(100)
        issues = page.locator('.resource').evaluate_all(probe)
    assert not issues, '; '.join(issues)


def assert_ambient_routes(page):
    issues=page.evaluate("""async () => {
      const scene=window.__e2e.main.game.scene.getScene('VillageScene'),ambient=scene.ambience;
      const url=performance.getEntriesByType('resource').find(e=>new URL(e.name).pathname==='/src/game/renderLayers.js').name;
      const {unitDepth}=await import(url),errors=[];
      if(ambient.actors.length>4)errors.push('More than four decorative actors');
      const expectedBlocked=new Set();
      for(const building of window.__e2e.state.getState().buildings){
        const [w,h]=window.__e2e.state.BUILDINGS[building.type].size;
        for(let i=building.x;i<building.x+w;i++)for(let j=building.y;j<building.y+h;j++)expectedBlocked.add(`${i},${j}`);
      }
      if(expectedBlocked.size!==ambient.grid.blocked.size||[...expectedBlocked].some(cell=>!ambient.grid.blocked.has(cell)))errors.push('Ambient obstacles do not match current building footprints');
      for(const actor of ambient.actors){
        if(actor.sprite.input)errors.push('Ambient actor intercepts map input');
        if(actor.sprite.displayList!==scene.layers.world)errors.push('Ambient actor outside shared world layer');
        if(Math.abs(actor.sprite.depth-unitDepth(actor.sprite.y))>.001)errors.push('Ambient actor sorted separately from buildings');
        if(ambient.grid.blocked.has(`${Math.round(actor.i)},${Math.round(actor.j)}`))errors.push('Ambient actor inside building footprint');
        for(let n=0;n<actor.path.length;n++){
          const at=actor.path[n],b=ambient.grid.bounds;
          if(at.i<b.minI||at.i>b.maxI||at.j<b.minJ||at.j>b.maxJ||ambient.grid.blocked.has(`${at.i},${at.j}`))errors.push('Ambient path enters building/outside neighbourhood');
          if(n&&Math.abs(at.i-actor.path[n-1].i)+Math.abs(at.j-actor.path[n-1].j)!==1)errors.push('Ambient actor cuts diagonally through footprint');
        }
      }
      return errors;
    }""")
    assert not issues,'; '.join(issues)


def assert_small_meter(page,selector):
    issues=page.locator(selector).evaluate("""track => {
      const window=track.querySelector('.meter-window'),fill=window?.firstElementChild,errors=[];
      if(!window||!fill)return ['Small meter has no independent clipped window'];
      const rim=getComputedStyle(track,'::after'),style=getComputedStyle(window),box=track.getBoundingClientRect(),inner=window.getBoundingClientRect(),paint=fill.getBoundingClientRect();
      if(Number(rim.zIndex)<=Number(style.zIndex)||rim.borderImageSlice.includes('fill'))errors.push('Small meter paints over/under opaque frame incorrectly');
      if(!rim.maskComposite.split(',').every(value=>value.trim()==='exclude'))errors.push('Small meter rim opening is opaque');
      if(style.overflow!=='hidden'||inner.left<box.left||inner.right>box.right||inner.top<box.top||inner.bottom>box.bottom||paint.width>inner.width+1)errors.push('Small meter escapes its rail');
      return errors;
    }""")
    assert not issues,'; '.join(issues)


def remember_ambient(page):
    page.evaluate("() => {const a=window.__e2e.main.game.scene.getScene('VillageScene').ambience;window.__stoppedAmbient={controller:a,sprites:a.actors.map(actor=>actor.sprite),reduced:a.reducedMotion};}")


def assert_ambient_destroyed(page):
    assert page.evaluate("() => {const old=window.__stoppedAmbient;return old.controller.destroyed&&old.controller.actors.length===0&&old.sprites.every(sprite=>!sprite.active);}"),'Previous ambience survives scene shutdown'
    assert page.evaluate("""() => {
      const old=window.__stoppedAmbient.controller;
      old.paused=false;
      Object.defineProperty(document,'hidden',{configurable:true,value:true});
      document.dispatchEvent(new Event('visibilitychange'));
      const listenerRemoved=!old.paused&&!old.scene.events.listeners('destroy').includes(old.onSceneDestroy);
      delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));
      return listenerRemoved;
    }"""),'Destroyed ambience still listens to visibility or scene destruction'
    page.emulate_media(reduced_motion='reduce')
    page.wait_for_timeout(100)
    assert page.evaluate('window.__stoppedAmbient.controller.reducedMotion===window.__stoppedAmbient.reduced'),'Destroyed ambience still listens to media changes'
    page.emulate_media(reduced_motion='no-preference')


def new_feature_probes(page,label):
    original=state(page)['resources']
    for percent in [0,1,50,100]:
        page.evaluate("percent => {const s=window.__e2e.state;for(const key of ['gold','wood','stone'])s.getState().resources[key]=s.cap()*percent/100;s.save();}",percent)
        page.wait_for_timeout(450)
        assert_resource_fill(page)
        assert_button_art(page,'[id^="resource-plus-"]')
        page.locator('.resource-stack').screenshot(path=str(OUT/f'meters-{label}-{percent:03d}.png'),animations='disabled')
    page.evaluate('resources => {Object.assign(window.__e2e.state.getState().resources,resources);window.__e2e.state.save();}',original)
    page.wait_for_timeout(450)
    before=state(page)
    page.wait_for_function("() => window.__e2e.main.game.scene.getScene('VillageScene').ambience.actors.some(a=>a.age>=700)",timeout=10000)
    page.evaluate("() => {const ambient=window.__e2e.main.game.scene.getScene('VillageScene').ambience;window.__ambientMoving={actor:ambient.actors[0],age:ambient.actors[0].age,i:ambient.actors[0].i,j:ambient.actors[0].j,poses:new Set()};window.__ambientSample=setInterval(()=>{if(window.__ambientMoving.actor.sprite.active)window.__ambientMoving.poses.add(window.__ambientMoving.actor.sprite.frame.name);},40);}")
    page.wait_for_function('() => window.__ambientMoving.actor.age>=window.__ambientMoving.age+1500',timeout=10000)
    moved=page.evaluate("() => {clearInterval(window.__ambientSample);const p=window.__ambientMoving;return {distance:Math.hypot(p.actor.i-p.i,p.actor.j-p.j),poses:p.poses.size};}")
    assert moved['distance']>.1 and moved['poses']>=2, f'Ambience does not walk/animate: {moved}'
    assert_ambient_routes(page)
    after=state(page)
    assert after['resources']==before['resources'] and after['troops']==before['troops']
    assert [(b['id'],b['type'],b['x'],b['y'],b['level']) for b in after['buildings']]==[(b['id'],b['type'],b['x'],b['y'],b['level']) for b in before['buildings']]
    screenshot(page,f'after-{label}-ambience')
    page.locator('#menu-settings').click()
    page.locator('#menu-help').click()
    page.wait_for_function("() => window.__e2e.main.game.scene.getScene('VillageScene').ambience.paused")
    page.evaluate("() => {const a=window.__ambientMoving.actor;window.__ambientFrozen=[a.age,a.i,a.j];}")
    page.wait_for_timeout(1100)
    assert page.evaluate("JSON.stringify(window.__ambientFrozen)===JSON.stringify([window.__ambientMoving.actor.age,window.__ambientMoving.actor.i,window.__ambientMoving.actor.j])"),'Ambient actor moves behind modal'
    page.keyboard.press('Escape')
    page.emulate_media(reduced_motion='reduce')
    page.wait_for_function("() => {const a=window.__e2e.main.game.scene.getScene('VillageScene').ambience;return a.reducedMotion&&a.actors.length===0;}")
    page.wait_for_timeout(900)
    assert scene_value(page,'scene.ambience.actors.length')==0
    page.emulate_media(reduced_motion='no-preference')
    page.wait_for_function("() => window.__e2e.main.game.scene.getScene('VillageScene').ambience.actors.some(a=>a.age>=700)",timeout=10000)
    # Simulate the platform visibility event without changing any gameplay fields.
    page.evaluate("() => {Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));const a=window.__e2e.main.game.scene.getScene('VillageScene').ambience;window.__hiddenAmbient=a.actors.map(p=>[p.age,p.i,p.j]);}")
    page.wait_for_timeout(700)
    assert page.evaluate("JSON.stringify(window.__hiddenAmbient)===JSON.stringify(window.__e2e.main.game.scene.getScene('VillageScene').ambience.actors.map(p=>[p.age,p.i,p.j]))"),'Ambient actor moves in hidden document'
    page.evaluate("() => {delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));}")
    assert_ambient_routes(page)


def show_goals(page):
    if page.locator('#goals-toggle').get_attribute('aria-expanded') == 'false':
        page.locator('#goals-toggle').click()
    expect(page.locator('#goal-action')).to_be_visible()


def run_viewport(browser, label, width, height):
    context = browser.new_context(viewport={'width':width,'height':height}, device_scale_factor=1)
    page = context.new_page()
    errors, failed = [], []
    page.on('pageerror', lambda err: errors.append(str(err)))
    page.on('requestfailed', lambda req: failed.append(req.url))
    page.on('response', lambda res: failed.append(f'{res.status} {res.url}') if res.status >= 400 else None)
    if label=='desktop':
        # First-run help must also disable a scene whose assets finish loading later.
        def delayed_ground(route):
            time.sleep(1.2)
            route.continue_()
        page.route('**/assets/prairie-astrub-etendue.webp',delayed_ground,times=1)
    page.goto(URL, wait_until='networkidle')
    install_observer(page)
    active(page, 'VillageScene')
    expect(page.locator('#astrub-startup')).to_be_hidden()
    expect(page.locator('#help-overlay')).to_be_visible()
    expect(page.locator('#game canvas')).to_have_count(1)
    assert scene_value(page, 'scene.input.enabled') is False
    screenshot(page, f'after-{label}-help')
    assert_in_view(page, '.help-modal')
    for selector in ['#app','#help-overlay','#game canvas']:
        box=page.locator(selector).bounding_box()
        assert box['x']==0 and box['y']==0 and box['width']==width and box['height']==height, f'Incorrect full-screen bounds: {selector} {box}'
    page.locator('#help-play').click()
    expect(page.locator('#help-overlay')).to_be_hidden()
    assert scene_value(page, 'scene.input.enabled') is True
    screenshot(page, f'after-{label}-village')
    for el in ['#build-toggle','#raid-btn','.resource-stack','.corner-menu']:
        assert_in_view(page, el)
    assert not page.evaluate('document.documentElement.scrollWidth > innerWidth')
    new_feature_probes(page,label)
    assert_resource_fill(page)
    assert_button_art(page, '#build-toggle,#raid-btn,.utility-btn,.goals-toggle')
    assert_button_art(page,'[id^="resource-plus-"]')
    assert_stable_buttons(page,'[id^="resource-plus-"]','#resource-plus-gold')
    for resource,type_name in [('gold','tower'),('wood','sawmill'),('stone','mine')]:
        wallet=state(page)['resources']
        page.locator(f'#resource-plus-{resource}').click()
        expect(page.locator('#build-filters [data-category="resources"]')).to_have_attribute('aria-selected','true')
        expect(page.locator(f'[data-building="{type_name}"]')).to_be_focused()
        assert state(page)['resources']==wallet, 'A resource shortcut must only open its producer card'
        page.locator('#build-close').click()

    # Every utility panel stays usable with illustrated graphics above it.
    page.locator('#menu-settings').click()
    expect(page.locator('#menu-settings')).to_have_attribute('aria-expanded','true')
    expect(page.locator('#settings-popover')).to_be_visible()
    assert_in_view(page,'#settings-popover')
    assert_button_art(page,'#menu-settings,#settings-popover button')
    screenshot(page,f'after-{label}-settings')
    before_reset=state(page)
    page.locator('#menu-reset').click()
    expect(page.locator('#reset-overlay')).to_be_visible()
    assert scene_value(page,'scene.input.enabled') is False
    assert_button_art(page,'#reset-overlay button')
    assert_in_view(page,'.reset-modal')
    screenshot(page,f'after-{label}-reset')
    page.locator('#reset-cancel').click()
    expect(page.locator('#reset-overlay')).to_be_hidden()
    assert state(page)['resources']==before_reset['resources']
    assert [(b['id'],b['x'],b['y'],b['level']) for b in state(page)['buildings']]==[(b['id'],b['x'],b['y'],b['level']) for b in before_reset['buildings']]
    page.locator('#menu-settings').click()
    page.locator('#menu-reset').click()
    page.keyboard.press('Escape')
    expect(page.locator('#reset-overlay')).to_be_hidden()
    page.locator('#menu-settings').click()
    page.locator('#menu-reset').click()
    page.mouse.click(3,3)
    expect(page.locator('#reset-overlay')).to_be_hidden()
    assert state(page)['resources']==before_reset['resources']
    page.locator('#menu-settings').click()
    page.locator('#menu-help').click()
    expect(page.locator('#help-overlay')).to_be_visible()
    expect(page.locator('#settings-popover')).to_be_hidden()
    assert scene_value(page,'scene.input.enabled') is False
    assert_button_art(page,'.help-modal button')
    zoom_before=camera(page)[2]
    page.locator('#zoom-in').click()
    assert camera(page)[2]>zoom_before
    page.locator('#zoom-out').click()
    assert abs(camera(page)[2]-zoom_before)<.001
    page.keyboard.press('Escape')
    expect(page.locator('#help-overlay')).to_be_hidden()
    assert scene_value(page,'scene.input.enabled') is True
    page.locator('#menu-settings').click()
    page.keyboard.press('Escape')
    expect(page.locator('#settings-popover')).to_be_hidden()

    # A producer exposes a real reserve, a collection button, and a full-store reason.
    producer=next(b for b in state(page)['buildings'] if b['type']=='mine')
    click_building(page,producer['id'])
    if page.locator('#selection-info-toggle').get_attribute('aria-expanded')=='false':
        page.locator('#selection-info-toggle').click()
    expect(page.locator('#collect-panel')).to_be_visible()
    assert_small_meter(page,'.collect-track')
    assert_in_view(page,'#building-details')
    assert_button_art(page,'#selection-panel button')
    screenshot(page,f'after-{label}-producer')
    original_resources=state(page)['resources']
    page.evaluate("id => {const s=window.__e2e.state;s.getState().buildings.find(b=>b.id===id).stored=40;s.getState().resources.stone=s.cap();s.save();}",producer['id'])
    expect(page.locator('#collect-btn')).to_be_disabled()
    expect(page.locator('#selection-feedback')).to_contain_text('Stockage plein')
    page.evaluate("({id,resources}) => {const s=window.__e2e.state;Object.assign(s.getState().resources,resources);s.getState().buildings.find(b=>b.id===id).stored=40;s.getState().lastTick=Date.now();s.save();}",{'id':producer['id'],'resources':original_resources})
    expect(page.locator('#collect-btn')).to_be_enabled()
    before_collect=state(page)
    page.locator('#collect-btn').click()
    assert state(page)['resources']['stone']>=before_collect['resources']['stone']+40
    page.locator('#detail-close').click()
    expect(page.locator('#selection-info-toggle')).to_have_attribute('aria-expanded','false')
    page.locator('#close-selection').click()
    # The first discovery objective opens the correct construction category.
    show_goals(page)
    page.locator('#goal-action').click()
    expect(page.locator('#build-filters [data-category="army"]')).to_have_attribute('aria-selected','true')
    expect(page.locator('[data-building="barracks"]')).to_be_visible()
    assert_button_art(page,'#build-filters button,#build-palette button')
    assert_stable_buttons(page,'#build-filters button,#build-palette button','#build-filters [data-category="army"]')
    screenshot(page,f'after-{label}-army')
    page.locator('#build-close').click()

    # A fresh village cannot launch a raid until a barracks is built.
    page.locator('#raid-btn').click()
    expect(page.locator('#expedition-overlay')).to_be_visible()
    expect(page.locator('#expedition-start')).to_be_disabled()
    expect(page.locator('#expedition-summary')).to_contain_text('caserne')
    assert scene_value(page, 'scene.input.enabled') is False
    before_camera = camera(page)
    page.keyboard.press('d')
    assert camera(page) == before_camera
    page.keyboard.press('Escape')
    expect(page.locator('#expedition-overlay')).to_be_hidden()
    expect(page.locator('#raid-btn')).to_be_focused()

    # Categories show clear costs and never allow an unaffordable choice.
    page.locator('#build-toggle').click()
    page.locator('#build-filters [data-category="resources"]').click()
    expect(page.locator('#build-filters [role="tab"]')).to_have_count(3)
    expect(page.locator('#build-palette [data-building]:visible')).to_have_count(3)
    screenshot(page, f'after-{label}-build')
    assert_in_view(page, '.build-popout')
    assert_button_art(page,'#build-filters button,#build-palette button')
    page.locator('#build-filters [data-category="economy"]').click()
    expect(page.locator('[data-building="warehouse"]')).to_be_visible()
    page.locator('#build-filters [data-category="army"]').click()
    barracks_card = page.locator('[data-building="barracks"]')
    expect(barracks_card).to_contain_text('360')
    expect(barracks_card).to_contain_text('210')
    original_resources = state(page)['resources']
    page.evaluate("async () => {const s=window.__e2e.state;Object.assign(s.getState().resources,{gold:0,wood:0,stone:0});s.save();}")
    expect(barracks_card).to_be_disabled()
    expect(barracks_card).to_contain_text('Manque')
    page.wait_for_timeout(450)
    assert_resource_fill(page)
    assert_stable_buttons(page,'#build-filters button,#build-palette button','#build-filters [data-category="army"]')
    page.evaluate("async r => {const s=window.__e2e.state;Object.assign(s.getState().resources,r);s.save();}", original_resources)
    expect(barracks_card).to_be_enabled()
    barracks_card.click()
    expect(page.locator('#placement-status')).to_be_visible()
    if page.locator('#build-toggle').get_attribute('aria-expanded') == 'true':
        page.locator('#build-toggle').click()
    slot = open_slot(page, 'barracks')
    assert slot, 'No accessible valid barracks slot'
    assert_in_view(page,'#placement-status')
    assert_button_art(page,'#placement-status button')
    townhall=next(b for b in state(page)['buildings'] if b['type']=='townhall')
    occupied=floor_point(page,townhall['id'])
    page.mouse.move(occupied['x'],occupied['y'])
    expect(page.locator('#placement-confirm')).to_be_disabled()
    expect(page.locator('#placement-status')).to_contain_text('occupée')
    page.wait_for_function("() => window.__e2e.main.game.scene.getScene('VillageScene').ambience.paused")
    page.evaluate("() => {const a=window.__e2e.main.game.scene.getScene('VillageScene').ambience;window.__placementActors=a.actors.map(actor=>({actor,age:actor.age,i:actor.i,j:actor.j,reroutes:actor.reroutes}));}")
    page.wait_for_timeout(700)
    assert page.evaluate('window.__placementActors.every(p=>p.age===p.actor.age&&p.i===p.actor.i&&p.j===p.actor.j)'),'Ambient actor moves during placement'
    before = state(page)
    page.mouse.move(slot['sx'],slot['sy'])
    expect(page.locator('#placement-confirm')).to_be_enabled()
    screenshot(page,f'after-{label}-placement')
    page.locator('#placement-confirm').click()
    page.wait_for_function("async n => (window.__e2e.state).getState().buildings.length===n", arg=len(before['buildings'])+1)
    after = state(page)
    assert_ambient_routes(page)
    assert page.evaluate('window.__placementActors.every(p=>!p.actor.sprite.active||p.actor.reroutes>p.reroutes)'),'Existing ambient routes were not refreshed after construction'
    barracks = next(b for b in after['buildings'] if b['type'] == 'barracks')
    assert barracks['x'] == slot['x'] and barracks['y'] == slot['y']
    for key, cost in [('gold',360),('wood',210),('stone',140)]:
        assert after['resources'][key] == before['resources'][key] - cost
    expect(page.locator('#placement-status')).to_be_hidden()

    # Real canvas selection, accessible details, training and free movement.
    click_building(page, barracks['id'])
    expect(page.locator('#selection-title')).to_have_text('Caserne')
    if page.locator('#selection-info-toggle').get_attribute('aria-expanded') == 'false':
        page.locator('#selection-info-toggle').click()
    expect(page.locator('#building-details')).to_be_visible()
    expect(page.locator('#train-controls')).to_be_visible()
    assert_in_view(page, '#selection-panel')
    assert_in_view(page, '#building-details')
    screenshot(page, f'after-{label}-barracks')
    assert_button_art(page,'#selection-panel button')
    assert_stable_buttons(page,'#selection-panel button','[data-unit="iop"]')
    before_train = state(page)
    page.evaluate("async () => {const s=window.__e2e.state;Object.assign(s.getState().resources,{gold:0,wood:0,stone:0});s.save();}")
    expect(page.locator('[data-unit="iop"]')).to_be_disabled()
    expect(page.locator('[data-unit="cra"]')).to_be_disabled()
    expect(page.locator('[data-unit="iop"]')).to_contain_text('Manque')
    assert_stable_buttons(page,'#selection-panel button')
    page.evaluate("async r => {const s=window.__e2e.state;Object.assign(s.getState().resources,r);s.save();}", before_train['resources'])
    page.locator('[data-unit="iop"]').click()
    after_train = state(page)
    assert len(after_train['queue']) == len(before_train['queue']) + 1
    assert after_train['resources']['gold'] == before_train['resources']['gold'] - 75
    assert after_train['resources']['wood'] == before_train['resources']['wood'] - 12
    page.locator('#selection-info-toggle').click()
    page.locator('#move-btn').click()
    expect(page.locator('#placement-status')).to_be_visible()
    move_slot = open_slot(page, 'barracks', barracks['id'])
    assert move_slot, 'No accessible valid movement slot'
    before_move = state(page)
    page.mouse.move(move_slot['sx'], move_slot['sy'])
    expect(page.locator('#placement-confirm')).to_be_enabled()
    page.locator('#placement-confirm').click()
    moved = next(b for b in state(page)['buildings'] if b['id'] == barracks['id'])
    assert_ambient_routes(page)
    assert (moved['x'],moved['y']) == (move_slot['x'],move_slot['y'])
    assert state(page)['resources'] == before_move['resources']
    expect(page.locator('#placement-status')).to_be_hidden()
    page.locator('#close-selection').click()

    # The next objective selects the principal building and exposes upgrade.
    expect(page.locator('#goal-count')).to_have_text('1/3')
    show_goals(page)
    page.locator('#goal-action').click()
    expect(page.locator('#selection-title')).to_have_text('Maison de guilde')
    expect(page.locator('#building-details')).to_be_visible()
    before_upgrade=state(page)
    page.locator('#upgrade-btn').click()
    expect(page.locator('#upgrade-btn')).to_be_disabled()
    expect(page.locator('#selection-timer')).to_be_visible()
    assert_small_meter(page,'.timer-track')
    after_upgrade=state(page)
    assert after_upgrade['resources']['gold']==before_upgrade['resources']['gold']-100
    assert after_upgrade['resources']['wood']==before_upgrade['resources']['wood']-50
    assert after_upgrade['resources']['stone']==before_upgrade['resources']['stone']-30
    # Advance only this upgrade's deadline; no 25-second wall-clock wait.
    page.evaluate("async () => {const s=window.__e2e.state;s.getState().buildings.find(b=>b.type==='townhall').upgradingUntil=Date.now()-1;s.getState().lastTick=Date.now()-600;s.tick();}")
    expect(page.locator('#selection-level')).to_have_text('2')
    expect(page.locator('#goal-count')).to_have_text('2/3')
    page.locator('#close-selection').click()
    show_goals(page)
    page.locator('#goal-action').click()
    expect(page.locator('#expedition-overlay')).to_be_visible()
    page.keyboard.press('Escape')
    expect(page.locator('#raid-btn')).to_be_focused()

    # Keyboard confirmation is a useful alternative to clicking the footprint.
    page.locator('#build-toggle').click()
    page.locator('#build-filters [data-category="resources"]').click()
    page.locator('[data-building="sawmill"]').click()
    keyboard_slot = open_slot(page, 'sawmill')
    assert keyboard_slot, 'No accessible keyboard placement slot'
    page.mouse.move(keyboard_slot['sx'],keyboard_slot['sy'])
    expect(page.locator('#placement-status')).to_contain_text('Emplacement libre')
    count = len(state(page)['buildings'])
    page.keyboard.press('Enter')
    page.wait_for_function("async n => (window.__e2e.state).getState().buildings.length===n", arg=count+1)
    expect(page.locator('#placement-status')).to_be_hidden()

    # Modal contains keyboard focus, blocks map input, then restores focus.
    page.locator('#raid-btn').click()
    expect(page.locator('#expedition-start')).to_be_enabled()
    assert page.evaluate("document.getElementById('expedition-overlay').contains(document.activeElement)")
    page.keyboard.press('Shift+Tab')
    assert page.evaluate("document.getElementById('expedition-overlay').contains(document.activeElement)")
    page.keyboard.press('Tab')
    assert page.evaluate("document.getElementById('expedition-overlay').contains(document.activeElement)")
    screenshot(page, f'after-{label}-expedition')
    assert_in_view(page, '.expedition-modal')
    assert_button_art(page,'.expedition-modal button')
    assert_stable_buttons(page,'.expedition-modal button','#expedition-start')
    page.keyboard.press('Escape')
    expect(page.locator('#raid-btn')).to_be_focused()
    page.locator('#raid-btn').click()
    page.wait_for_function('() => window.__e2e.state.getState().queue.length===0',timeout=15000)
    remember_ambient(page)
    page.locator('#expedition-start').click()
    active(page, 'BattleScene')
    assert_ambient_destroyed(page)
    expect(page.locator('#battle-controls')).to_be_visible()
    expect(page.locator('#raid-btn')).to_be_hidden()
    for resource in ['gold','wood','stone']:
        expect(page.locator(f'#resource-plus-{resource}')).to_be_hidden()
        expect(page.locator(f'#resource-plus-{resource}')).to_be_disabled()
    screenshot(page, f'after-{label}-battle')
    assert_in_view(page, '#battle-controls')
    assert_button_art(page,'#battle-controls button,#menu-settings,#menu-home')
    assert_in_view(page,'.corner-menu')
    troop_cra=page.locator('#troop-palette .build-card').filter(has_text='Crâ')
    troop_iop=page.locator('#troop-palette .build-card').filter(has_text='Iop')
    troop_cra.click()
    expect(troop_cra).to_be_focused()
    expect(troop_cra).to_have_attribute('aria-pressed','true')
    troop_iop.click()
    expect(troop_iop).to_be_focused()
    assert_stable_buttons(page,'#troop-palette button,#leave-battle')
    # Real canvas clicks deploy troops; returning consumes precisely those units.
    pt = page.evaluate("""async () => {const {game}=window.__e2e.main;const {xy}=window.__e2e.iso;const scene=game.scene.getScene('BattleScene');const world=xy(3,3);const cam=scene.cameras.main;const pt=cam.matrix.transformPoint(world.x-cam.scrollX,world.y-cam.scrollY);return {x:pt.x,y:pt.y,tag:document.elementFromPoint(pt.x,pt.y)?.tagName};}""")
    assert pt['tag'] == 'CANVAS', f'Deployment zone obscured: {pt}'
    before_battle = state(page)
    deployed_iops=1
    newly_trained=0
    if label=='desktop':
        # Finish an actual paid training while its troop card is exhausted.
        page.evaluate("() => {const s=window.__e2e.state;const result=s.train('iop');if(!result.ok)throw new Error(result.msg);window.__regressionIop=document.querySelector('[data-troop=\"iop\"]');}")
        deployed_iops=before_battle['troops']['iop']
    for _ in range(deployed_iops):
        page.mouse.click(pt['x'],pt['y'])
    page.wait_for_function("n => window.__e2e.main.game.scene.getScene('BattleScene').used.iop===n",arg=deployed_iops)
    if label=='desktop':
        expect(troop_iop).to_be_disabled()
        page.evaluate("() => {const s=window.__e2e.state;s.getState().queue.find(q=>q.type==='iop').ends=Date.now()-1;s.getState().lastTick=Date.now()-600;s.tick();}")
        expect(troop_iop).to_be_enabled()
        expect(troop_iop.locator('.build-cost')).to_have_text('1 disponible(s)')
        assert page.evaluate("window.__regressionIop===document.querySelector('[data-troop=\"iop\"]')"), 'Training must update the existing troop card'
        newly_trained=1
    page.locator('#leave-battle').click()
    active(page, 'VillageScene')
    assert scene_value(page,'scene.ambience.destroyed') is False
    assert_ambient_routes(page)
    final = state(page)
    assert final['troops']['iop'] == before_battle['troops']['iop'] + newly_trained - deployed_iops
    assert final['troops']['cra'] == before_battle['troops']['cra']
    saved = page.evaluate("JSON.parse(localStorage.getItem('astrub_village_local_v1'))")
    assert saved['buildings'] == final['buildings']
    assert saved['troops'] == final['troops']
    if label == 'desktop':
        # One complete raid proves the reward and all discovery objectives.
        page.wait_for_function('() => window.__e2e.state.getState().queue.length===0',timeout=15000)
        page.locator('#raid-btn').click()
        page.locator('#expedition-start').click()
        active(page,'BattleScene')
        before_victory=state(page)
        winning_iops=min(3,before_victory['troops']['iop'])
        assert winning_iops>=1
        storage=page.evaluate('window.__e2e.state.cap()')
        pt=page.evaluate("() => {const {game}=window.__e2e.main;const world=window.__e2e.iso.xy(3,3);const cam=game.scene.getScene('BattleScene').cameras.main;const p=cam.matrix.transformPoint(world.x-cam.scrollX,world.y-cam.scrollY);return {x:p.x,y:p.y};}")
        for _ in range(winning_iops):
            page.mouse.click(pt['x'],pt['y'])
        page.locator('#troop-palette .build-card').filter(has_text='Crâ').click()
        for _ in range(3):
            page.mouse.click(pt['x'],pt['y'])
        page.wait_for_function('n => window.__e2e.main.game.scene.getScene("BattleScene").used.iop===n && window.__e2e.main.game.scene.getScene("BattleScene").used.cra===3',arg=winning_iops)
        page.wait_for_function('wins => window.__e2e.state.getState().wins===wins+1',arg=before_victory['wins'],timeout=45000)
        won=state(page)
        for key,reward in [('gold',650),('wood',250),('stone',140)]:
            assert won['resources'][key]==min(storage,before_victory['resources'][key]+reward)
        assert won['troops']['iop']==before_victory['troops']['iop']-winning_iops
        assert won['troops']['cra']==before_victory['troops']['cra']-3
        active(page,'VillageScene')
        expect(page.locator('#goal-count')).to_have_text('3/3')
        expect(page.locator('#goal-current')).to_have_text('Votre village prend vie !')
        final=state(page)
        screenshot(page,'after-desktop-victory-return')
    page.reload(wait_until='networkidle')
    install_observer(page)
    active(page, 'VillageScene')
    expect(page.locator('#help-overlay')).to_be_hidden()
    assert state(page)['troops'] == final['troops']
    assert [(b['id'],b['x'],b['y']) for b in state(page)['buildings']] == [(b['id'],b['x'],b['y']) for b in final['buildings']]
    # Reset from inside a raid must stop that raid before creating the new save.
    if sum(state(page)['troops'].values())==0:
        page.evaluate("() => {const s=window.__e2e.state;const result=s.train('iop');if(!result.ok)throw new Error(result.msg);s.getState().queue.find(q=>q.type==='iop').ends=Date.now()-1;s.getState().lastTick=Date.now()-600;s.tick();}")
    page.locator('#raid-btn').click()
    remember_ambient(page)
    page.locator('#expedition-start').click()
    active(page,'BattleScene')
    assert_ambient_destroyed(page)
    page.locator('#menu-settings').click()
    page.locator('#menu-reset').click()
    expect(page.locator('#reset-overlay')).to_be_visible()
    assert page.evaluate("window.__e2e.main.game.scene.getScene('BattleScene').input.enabled===false")
    page.locator('#reset-confirm').click()
    active(page,'VillageScene')
    page.wait_for_function("() => !window.__e2e.main.game.scene.isActive('BattleScene')")
    expect(page.locator('#reset-overlay')).to_be_hidden()
    expect(page.locator('#goal-count')).to_have_text('0/3')
    assert state(page)['resources']=={'gold':2050,'wood':830,'stone':500}
    assert state(page)['troops']=={'iop':3,'cra':3}
    assert len(state(page)['buildings'])==4
    page.wait_for_timeout(1200)
    assert state(page)['wins']==0 and state(page)['resources']=={'gold':2050,'wood':830,'stone':500}
    assert not errors, f'Page errors: {errors}'
    assert not failed, f'Failed requests: {failed}'
    result = {'viewport': label, 'width':width,'height':height,'checks':'startup/fullscreen, decorative layers/hit areas, resource fill/producer shortcuts, settings/help/zoom/reset cancel/Escape/outside, collection/capacity, persistent button graphics/labels/focus, discovery objectives, build costs/availability, valid/invalid placement and confirmation button, canvas building, training, free move, upgrade timer, Enter placement, modal focus/escape/input, troop selection, combat deploy/return, save/reload, confirmed reset stops previous battle'+(', training completion reactivates troop card, victory/reward/troop accounting/3 objectives complete' if label=='desktop' else ''),'meter_percentages':[0,1,50,100],'ambience':'walking poses, shared world depth, non-interactivity, bounded routes/building obstacles, modal/placement/hidden pause, reduced motion, reroute, scene cleanup','pageerrors':errors,'failed_requests':failed}
    context.close()
    return result


if __name__ == '__main__':
    OUT.mkdir(parents=True,exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path=os.getenv('ASTRUB_CHROMIUM') or shutil.which('chromium') or shutil.which('chromium-browser'), args=['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader'])
        results = []
        for label,width,height in VIEWPORTS:
            print(f'Checking {label} {width}x{height}', flush=True)
            try:
                results.append(run_viewport(browser,label,width,height))
            except Exception as error:
                print(str(error),flush=True)
                for context in browser.contexts:
                    for page in context.pages:
                        screenshot(page,f'failure-{label}')
                raise
            (OUT / 'e2e-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
            print(f'PASS {label}',flush=True)
        browser.close()
    (OUT / 'e2e-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
    print(json.dumps(results,ensure_ascii=False,indent=2))
