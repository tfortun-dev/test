(function () {
"use strict";
var CATALOG=[{"no":"001","name":"Loufeuteau","slug":"emberpup","elements":["Feu","Terre"],"role":"DPS","stats":{"pv":67,"rupt":40,"atq":90,"defm":57,"defp":60,"regen":68}},{"no":"002","name":"Jappardent","slug":"flameruff","elements":["Feu","Terre"],"role":"DPS","stats":{"pv":85,"rupt":45,"atq":111,"defm":63,"defp":72,"regen":80}},{"no":"003","name":"Hurlebrasier","slug":"scorchhowl","elements":["Feu","Terre","Foudre"],"role":"DPS","stats":{"pv":95,"rupt":52,"atq":119,"defm":75,"defp":80,"regen":90}},{"no":"004","name":"Inferlupin","slug":"inferlupa","elements":["Feu","Obscurité"],"role":"BREAK","stats":{"pv":95,"rupt":108,"atq":89,"defm":80,"defp":70,"regen":99}},{"no":"005","name":"Célestia","slug":"celestis","elements":["Obscurité"],"role":"DPS","stats":{"pv":81,"rupt":46,"atq":106,"defm":58,"defp":58,"regen":80}},{"no":"006","name":"Stellaria","slug":"stellarys","elements":["Obscurité","Eau","Glace"],"role":"DPS","stats":{"pv":95,"rupt":54,"atq":125,"defm":69,"defp":68,"regen":94}},{"no":"007","name":"Cuicui","slug":"chirpi","elements":["Vent","Eau","Plante"],"role":"Soutien","stats":{"pv":97,"rupt":43,"atq":83,"defm":69,"defp":67,"regen":93}},{"no":"008","name":"Trombec","slug":"tromber","elements":["Vent","Eau","Plante"],"role":"Soutien","stats":{"pv":113,"rupt":51,"atq":119,"defm":81,"defp":79,"regen":88}},{"no":"009","name":"Clairbec","slug":"cornet","elements":["Vent","Eau","Foudre","Plante"],"role":"DPS","stats":{"pv":96,"rupt":54,"atq":121,"defm":70,"defp":74,"regen":94}},{"no":"010","name":"Tubabec","slug":"tubster","elements":["Vent","Eau","Plante"],"role":"BREAK","stats":{"pv":108,"rupt":107,"atq":80,"defm":109,"defp":66,"regen":80}},{"no":"011","name":"Iris","slug":"iris","elements":["Plante"],"role":"DPS","stats":{"pv":69,"rupt":50,"atq":101,"defm":53,"defp":53,"regen":71}},{"no":"012","name":"Valsiris","slug":"irisal","elements":["Plante"],"role":"DPS","stats":{"pv":100,"rupt":52,"atq":118,"defm":70,"defp":70,"regen":94}},{"no":"013","name":"Tilotus","slug":"skippy","elements":["Eau","Glace"],"role":"Soin","stats":{"pv":80,"rupt":50,"atq":70,"defm":76,"defp":66,"regen":60}},{"no":"014","name":"Filoutus","slug":"pranky","elements":["Eau","Glace"],"role":"Soin","stats":{"pv":109,"rupt":50,"atq":85,"defm":98,"defp":66,"regen":74}},{"no":"015","name":"Givrotus","slug":"glacy","elements":["Eau","Glace","Lumière"],"role":"Soin","stats":{"pv":120,"rupt":50,"atq":95,"defm":110,"defp":72,"regen":88}},{"no":"016","name":"Voilotus","slug":"leafy","elements":["Plante","Eau"],"role":"RÉGÉN","stats":{"pv":120,"rupt":50,"atq":95,"defm":82,"defp":82,"regen":106}},{"no":"017","name":"Cumulaine","slug":"nimbi","elements":["Vent","Foudre","Glace"],"role":"Soutien","stats":{"pv":80,"rupt":43,"atq":84,"defm":82,"defp":69,"regen":93}},{"no":"018","name":"Turbulaine","slug":"turbo","elements":["Vent","Foudre","Obscurité","Glace"],"role":"Soutien","stats":{"pv":95,"rupt":50,"atq":110,"defm":96,"defp":80,"regen":87}},{"no":"019","name":"Lainirique","slug":"dreaple","elements":["Obscurité"],"role":"Soutien","stats":{"pv":100,"rupt":50,"atq":110,"defm":103,"defp":77,"regen":80}},{"no":"020","name":"Fredon","slug":"hummin","elements":["Plante"],"role":"BREAK","stats":{"pv":94,"rupt":80,"atq":68,"defm":94,"defp":71,"regen":60}},{"no":"021","name":"Hexxin","slug":"witchin","elements":["Obscurité","Plante"],"role":"RÉGÉN","stats":{"pv":115,"rupt":50,"atq":88,"defm":90,"defp":84,"regen":115}},{"no":"022","name":"Nutrion","slug":"tuckin","elements":["Plante","Terre"],"role":"BREAK","stats":{"pv":106,"rupt":100,"atq":80,"defm":110,"defp":83,"regen":71}},{"no":"023","name":"Crabourgeon","slug":"budclaw","elements":["Terre","Plante"],"role":"BREAK","stats":{"pv":76,"rupt":84,"atq":64,"defm":65,"defp":93,"regen":72}},{"no":"024","name":"Crabiflore","slug":"shrubclaw","elements":["Terre","Plante"],"role":"BREAK","stats":{"pv":95,"rupt":104,"atq":80,"defm":77,"defp":109,"regen":85}},{"no":"025","name":"Cristocrabe","slug":"geoclaw","elements":["Glace"],"role":"BREAK","stats":{"pv":93,"rupt":103,"atq":80,"defm":79,"defp":113,"regen":82}},{"no":"026","name":"Farfafeu","slug":"sparki","elements":["Feu"],"role":"RÉGÉN","stats":{"pv":69,"rupt":41,"atq":100,"defm":67,"defp":60,"regen":98}},{"no":"027","name":"Flamirage","slug":"flamerion","elements":["Feu"],"role":"RÉGÉN","stats":{"pv":80,"rupt":50,"atq":113,"defm":89,"defp":70,"regen":115}},{"no":"028","name":"Fluoretti","slug":"flutternym","elements":["Vent","Plante","Obscurité","Terre"],"role":"Soin","stats":{"pv":94,"rupt":41,"atq":81,"defm":68,"defp":68,"regen":85}},{"no":"029","name":"Voletti","slug":"gracewing","elements":["Vent","Plante","Obscurité","Terre"],"role":"Soin","stats":{"pv":110,"rupt":50,"atq":98,"defm":85,"defp":85,"regen":104}},{"no":"030","name":"Vitti","slug":"somniwing","elements":["Vent","Plante"],"role":"RÉGÉN","stats":{"pv":111,"rupt":50,"atq":92,"defm":85,"defp":85,"regen":115}},{"no":"031","name":"Eko","slug":"eko","elements":["Vent"],"role":"Soutien","stats":{"pv":70,"rupt":42,"atq":108,"defm":57,"defp":70,"regen":80}},{"no":"032","name":"Ekolombo","slug":"eklue","elements":["Vent"],"role":"Soutien","stats":{"pv":100,"rupt":49,"atq":120,"defm":67,"defp":83,"regen":91}},{"no":"033","name":"Bourgeonnet","slug":"budsquire","elements":["Plante"],"role":"DPS","stats":{"pv":82,"rupt":43,"atq":107,"defm":59,"defp":59,"regen":78}},{"no":"034","name":"Rapiéronce","slug":"thornblade","elements":["Plante","Foudre","Eau"],"role":"DPS","stats":{"pv":96,"rupt":53,"atq":121,"defm":73,"defp":74,"regen":92}},{"no":"035","name":"Méliflore","slug":"melloblum","elements":["Plante","Lumière"],"role":"Soutien","stats":{"pv":95,"rupt":91,"atq":113,"defm":70,"defp":70,"regen":78}},{"no":"036","name":"Pomœuf","slug":"pomegg","elements":["Plante","Glace"],"role":"BREAK","stats":{"pv":74,"rupt":91,"atq":72,"defm":65,"defp":68,"regen":85}},{"no":"037","name":"Pomawk","slug":"pomawk","elements":["Plante","Glace"],"role":"BREAK","stats":{"pv":87,"rupt":107,"atq":90,"defm":76,"defp":80,"regen":100}},{"no":"038","name":"Plumiel","slug":"dewy","elements":["Obscurité"],"role":"Soutien","stats":{"pv":71,"rupt":69,"atq":94,"defm":55,"defp":58,"regen":94}},{"no":"039","name":"Fragrancier","slug":"fragrancier","elements":["Obscurité"],"role":"Soutien","stats":{"pv":84,"rupt":81,"atq":111,"defm":65,"defp":68,"regen":110}},{"no":"040","name":"Flammi","slug":"wisptis","elements":["Obscurité","Plante","Feu"],"role":"DPS","stats":{"pv":77,"rupt":43,"atq":112,"defm":54,"defp":60,"regen":77}},{"no":"041","name":"Igniti","slug":"ignitis","elements":["Obscurité","Plante","Feu"],"role":"DPS","stats":{"pv":90,"rupt":52,"atq":125,"defm":70,"defp":77,"regen":91}},{"no":"042","name":"Osky","slug":"bonesky","elements":["Glace","Obscurité"],"role":"DPS","stats":{"pv":71,"rupt":38,"atq":88,"defm":57,"defp":56,"regen":67}},{"no":"043","name":"Glaivrier","slug":"fenrier","elements":["Glace","Obscurité"],"role":"DPS","stats":{"pv":86,"rupt":45,"atq":105,"defm":68,"defp":68,"regen":81}},{"no":"044","name":"Molosabre","slug":"glynsera","elements":["Glace","Lumière","Obscurité"],"role":"DPS","stats":{"pv":95,"rupt":53,"atq":118,"defm":76,"defp":72,"regen":98}},{"no":"045","name":"Voltige","slug":"bolty","elements":["Foudre"],"role":"BREAK","stats":{"pv":85,"rupt":87,"atq":85,"defm":60,"defp":60,"regen":73}},{"no":"046","name":"Voltignasse","slug":"blazen","elements":["Foudre","Obscurité"],"role":"BREAK","stats":{"pv":100,"rupt":104,"atq":100,"defm":70,"defp":70,"regen":86}},{"no":"047","name":"Écurixe","slug":"squarrel","elements":["Feu"],"role":"BREAK","stats":{"pv":53,"rupt":94,"atq":80,"defm":72,"defp":79,"regen":77}},{"no":"048","name":"Écurouste","slug":"squashel","elements":["Feu"],"role":"BREAK","stats":{"pv":110,"rupt":108,"atq":82,"defm":80,"defp":80,"regen":88}},{"no":"049","name":"Louloutre","slug":"susuta","elements":["Eau"],"role":"BREAK","stats":{"pv":81,"rupt":72,"atq":61,"defm":80,"defp":53,"regen":64}},{"no":"050","name":"Bulloutre","slug":"popota","elements":["Eau"],"role":"BREAK","stats":{"pv":92,"rupt":80,"atq":96,"defm":68,"defp":68,"regen":67}},{"no":"051","name":"Ondeloutre","slug":"piopiota","elements":["Eau","Obscurité"],"role":"Soutien","stats":{"pv":102,"rupt":50,"atq":108,"defm":75,"defp":99,"regen":88}},{"no":"052","name":"Terriloutre","slug":"panpanta","elements":["Eau"],"role":"BREAK","stats":{"pv":104,"rupt":100,"atq":85,"defm":106,"defp":70,"regen":80}},{"no":"053","name":"Astrid","slug":"shelly","elements":["Eau"],"role":"DPS","stats":{"pv":75,"rupt":39,"atq":90,"defm":56,"defp":56,"regen":66}},{"no":"054","name":"Astor","slug":"sheldon","elements":["Eau"],"role":"DPS","stats":{"pv":90,"rupt":44,"atq":109,"defm":68,"defp":68,"regen":79}},{"no":"055","name":"Astrophel","slug":"sherro","elements":["Eau","Foudre","Lumière"],"role":"DPS","stats":{"pv":100,"rupt":50,"atq":121,"defm":75,"defp":75,"regen":88}},{"no":"056","name":"Balabée","slug":"baleetle","elements":["Terre","Glace"],"role":"DPS","stats":{"pv":76,"rupt":42,"atq":98,"defm":68,"defp":68,"regen":85}},{"no":"057","name":"Coléobée","slug":"waleetle","elements":["Terre","Glace","Obscurité"],"role":"DPS","stats":{"pv":90,"rupt":52,"atq":114,"defm":80,"defp":80,"regen":100}},{"no":"058","name":"Boulabée","slug":"bouldus","elements":["Terre","Glace"],"role":"Soutien","stats":{"pv":91,"rupt":52,"atq":114,"defm":54,"defp":101,"regen":104}},{"no":"059","name":"Touffu","slug":"fentuft","elements":["Foudre"],"role":"DPS","stats":{"pv":85,"rupt":41,"atq":106,"defm":60,"defp":60,"regen":77}},{"no":"060","name":"Fulgucrin","slug":"fenmane","elements":["Foudre","Lumière"],"role":"DPS","stats":{"pv":100,"rupt":50,"atq":125,"defm":70,"defp":70,"regen":90}},{"no":"061","name":"Casquimou","slug":"helmut","elements":["Obscurité","Glace"],"role":"BREAK","stats":{"pv":60,"rupt":60,"atq":52,"defm":48,"defp":68,"regen":51}},{"no":"062","name":"Casquipreux","slug":"pawney","elements":["Obscurité","Glace"],"role":"DPS","stats":{"pv":90,"rupt":55,"atq":125,"defm":70,"defp":84,"regen":81}},{"no":"063","name":"Casquillon","slug":"rookey","elements":["Obscurité","Glace"],"role":"BREAK","stats":{"pv":100,"rupt":105,"atq":90,"defm":70,"defp":100,"regen":75}},{"no":"064","name":"Machou","slug":"jawling","elements":["Vent"],"role":"BREAK","stats":{"pv":78,"rupt":76,"atq":65,"defm":51,"defp":74,"regen":63}},{"no":"065","name":"Casquimord","slug":"helmwhelp","elements":["Vent"],"role":"BREAK","stats":{"pv":94,"rupt":92,"atq":78,"defm":61,"defp":88,"regen":76}},{"no":"066","name":"Cuiragon","slug":"helgon","elements":["Vent"],"role":"BREAK","stats":{"pv":104,"rupt":102,"atq":87,"defm":68,"defp":98,"regen":84}},{"no":"067","name":"Infergon","slug":"infergon","elements":["Feu","Vent"],"role":"DPS","stats":{"pv":95,"rupt":50,"atq":125,"defm":85,"defp":70,"regen":80}},{"no":"068","name":"Ourso","slug":"cubbo","elements":["Terre"],"role":"DPS","stats":{"pv":92,"rupt":42,"atq":100,"defm":61,"defp":70,"regen":70}},{"no":"069","name":"Grizzo","slug":"grizbo","elements":["Terre","Obscurité"],"role":"DPS","stats":{"pv":104,"rupt":50,"atq":124,"defm":70,"defp":83,"regen":75}},{"no":"070","name":"Silexodon","slug":"pebbling","elements":["Terre"],"role":"BREAK","stats":{"pv":83,"rupt":79,"atq":68,"defm":74,"defp":52,"regen":56}},{"no":"071","name":"Lavasaure","slug":"lavazar","elements":["Feu","Terre"],"role":"BREAK","stats":{"pv":99,"rupt":93,"atq":82,"defm":80,"defp":63,"regen":68}},{"no":"072","name":"Magmarex","slug":"magmarex","elements":["Feu","Terre","Obscurité"],"role":"BREAK","stats":{"pv":110,"rupt":104,"atq":91,"defm":89,"defp":70,"regen":75}},{"no":"073","name":"Géodosaure","slug":"geodeback","elements":["Terre"],"role":"BREAK","stats":{"pv":99,"rupt":102,"atq":81,"defm":54,"defp":80,"regen":70}},{"no":"074","name":"Cristorex","slug":"minespine","elements":["Terre"],"role":"BREAK","stats":{"pv":110,"rupt":105,"atq":90,"defm":60,"defp":97,"regen":78}},{"no":"075","name":"Cabaroc","slug":"cozite","elements":["Terre"],"role":"Soutien","stats":{"pv":77,"rupt":50,"atq":87,"defm":67,"defp":67,"regen":100}},{"no":"076","name":"Bastiroc","slug":"bailite","elements":["Terre"],"role":"Soutien","stats":{"pv":90,"rupt":50,"atq":116,"defm":83,"defp":100,"regen":75}},{"no":"077","name":"Bulbi","slug":"bulbly","elements":["Foudre"],"role":"Soutien","stats":{"pv":83,"rupt":37,"atq":68,"defm":63,"defp":63,"regen":90}},{"no":"078","name":"Voilueur","slug":"veilfloat","elements":["Foudre"],"role":"Soutien","stats":{"pv":99,"rupt":45,"atq":93,"defm":74,"defp":72,"regen":90}},{"no":"079","name":"Luminelle","slug":"luminelle","elements":["Foudre","Eau","Lumière"],"role":"Soutien","stats":{"pv":110,"rupt":50,"atq":115,"defm":75,"defp":75,"regen":90}},{"no":"080","name":"Falou","slug":"fahloo","elements":["Eau"],"role":"RÉGÉN","stats":{"pv":102,"rupt":44,"atq":76,"defm":76,"defp":68,"regen":93}},{"no":"081","name":"Fabulle","slug":"erlath","elements":["Eau"],"role":"RÉGÉN","stats":{"pv":120,"rupt":50,"atq":90,"defm":90,"defp":80,"regen":110}},{"no":"082","name":"Pulsato","slug":"besauce","elements":["Foudre"],"role":"RÉGÉN","stats":{"pv":88,"rupt":90,"atq":92,"defm":75,"defp":75,"regen":118}},{"no":"084","name":"Reefish","slug":"reefish","elements":["Terre","Eau"],"role":"RÉGÉN","stats":{"pv":83,"rupt":91,"atq":66,"defm":79,"defp":75,"regen":92}},{"no":"085","name":"Coraliz","slug":"coraliz","elements":["Terre","Eau"],"role":"RÉGÉN","stats":{"pv":98,"rupt":107,"atq":78,"defm":93,"defp":88,"regen":108}},{"no":"086","name":"Cheekie","slug":"cheekie","elements":["Glace"],"role":"BREAK","stats":{"pv":89,"rupt":92,"atq":64,"defm":79,"defp":76,"regen":88}},{"no":"087","name":"Wavwal","slug":"wavwal","elements":["Glace"],"role":"BREAK","stats":{"pv":105,"rupt":110,"atq":75,"defm":93,"defp":89,"regen":103}},{"no":"088","name":"Bubbeep","slug":"bubbeep","elements":["Plante","Eau"],"role":"Soin","stats":{"pv":104,"rupt":43,"atq":85,"defm":75,"defp":78,"regen":82}},{"no":"089","name":"Glameep","slug":"glameep","elements":["Plante","Eau","Obscurité"],"role":"Soin","stats":{"pv":122,"rupt":50,"atq":100,"defm":89,"defp":92,"regen":97}},{"no":"090","name":"Popapus","slug":"popapus","elements":["Eau"],"role":"DPS","stats":{"pv":90,"rupt":45,"atq":102,"defm":65,"defp":58,"regen":90}},{"no":"091","name":"Gachapus","slug":"gachapus","elements":["Eau"],"role":"DPS","stats":{"pv":106,"rupt":51,"atq":121,"defm":77,"defp":68,"regen":106}},{"no":"092","name":"Malangel","slug":"malangel","elements":["Glace"],"role":"DPS","stats":{"pv":100,"rupt":50,"atq":105,"defm":80,"defp":80,"regen":100}},{"no":"093","name":"Malevsera","slug":"malevsera","elements":["Glace"],"role":"DPS","stats":{"pv":88,"rupt":52,"atq":125,"defm":80,"defp":70,"regen":110}},{"no":"","name":"Jabster","slug":"jabster","elements":["Eau"],"role":"","stats":{"pv":104,"rupt":50,"atq":120,"defm":78,"defp":80,"regen":88}},{"no":"","name":"Morphling","slug":"morphling","elements":[],"role":"","stats":{"pv":77,"rupt":50,"atq":77,"defm":67,"defp":67,"regen":100}},{"no":"10001","name":"Lumiris","slug":"irisalis","elements":["Plante"],"role":"DPS","stats":{"pv":90,"rupt":56,"atq":130,"defm":78,"defp":78,"regen":108}},{"no":"10002","name":"Danzard","slug":"dazmand","elements":["Foudre"],"role":"Soutien","stats":{"pv":100,"rupt":55,"atq":108,"defm":90,"defp":81,"regen":88}},{"no":"10003","name":"Fulmi","slug":"fulmintis","elements":["Foudre","Lumière"],"role":"DPS","stats":{"pv":99,"rupt":50,"atq":130,"defm":70,"defp":66,"regen":105}},{"no":"11001","name":"Elfe solidaire","slug":"sparkelf","elements":["Feu"],"role":"","stats":{"pv":107,"rupt":50,"atq":113,"defm":88,"defp":60,"regen":99}},{"no":"99996","name":"Lunara","slug":"lunara","elements":["Lumière"],"role":"","stats":{"pv":100,"rupt":64,"atq":116,"defm":72,"defp":72,"regen":90}},{"no":"99998","name":"Hélion","slug":"helion","elements":["Lumière"],"role":"","stats":{"pv":100,"rupt":64,"atq":116,"defm":72,"defp":72,"regen":90}}];
var PRIORITIES=["Crabiflore","Igniti","Pomawk","Boulabée","Écurouste","Infergon","Magmarex","Pulsato"];
var OBTAIN={"Loufeuteau":"Capture sauvage : Détroit argenté, Crête des crocs, Plateau de clairebranche et Grève d'échoflux.","Jappardent":"Capture sauvage : Détroit argenté, Crête des crocs, Grève d'échoflux et Champs de Cumulaine. Peut aussi évoluer depuis Loufeuteau.","Hurlebrasier":"Capture sauvage : Crête des crocs. Peut aussi évoluer depuis Jappardent.","Inferlupin":"Ne se trouve pas à l'état sauvage : évolution de Jappardent.","Célestia":"Capture sauvage : Champs de Cumulaine, Détroit argenté, Grève d'échoflux et Forêt des météores.","Stellaria":"Capture sauvage : Forêt des météores. Peut aussi évoluer depuis Célestia.","Cuicui":"Capture sauvage : Détroit argenté, Crête des crocs, Forêt des foudres et Plateau de clairebranche.","Trombec":"Capture sauvage : Détroit argenté, Forêt des météores et Isthme du zéphyr. Peut aussi évoluer depuis Cuicui.","Clairbec":"Capture sauvage : Détroit argenté, Grève d'échoflux, Forêt des météores et Isthme du zéphyr. Peut aussi évoluer depuis Cuicui.","Tubabec":"Capture sauvage : Détroit argenté, Grève d'échoflux, Hautes-plaines ocres et Isthme du zéphyr. Peut aussi évoluer depuis Cuicui.","Iris":"Capture sauvage : Détroit argenté, Crête des crocs, Voie de béryl et Forêt des foudres.","Valsiris":"Capture sauvage : Voie de béryl, Forêt des foudres, Pré-aux-frimas et Forêt des météores. Peut aussi évoluer depuis Iris.","Tilotus":"Capture sauvage : Détroit argenté, Pré-aux-frimas, Forêt des météores et Bois brumeux.","Filoutus":"Capture sauvage : Pré-aux-frimas, Forêt des météores, Bois brumeux et Champs de Cumulaine. Peut aussi évoluer depuis Tilotus.","Givrotus":"Capture sauvage : Pré-aux-frimas et Mer florale. Peut aussi évoluer depuis Filoutus.","Voilotus":"Capture sauvage : Bois brumeux. Peut aussi évoluer depuis Filoutus.","Cumulaine":"Capture sauvage : Détroit argenté, Pré-aux-frimas et Champs de Cumulaine.","Turbulaine":"Capture sauvage : Pré-aux-frimas et Champs de Cumulaine. Peut aussi évoluer depuis Cumulaine.","Lainirique":"Ne se trouve pas à l'état sauvage : évolution de Cumulaine.","Fredon":"Capture sauvage : Détroit argenté, Voie de béryl, Forêt des foudres et Plateau de clairebranche.","Hexxin":"Capture sauvage : Voie de béryl, Bois brumeux et Mer florale.","Nutrion":"Ne se trouve pas à l'état sauvage : évolution de Fredon.","Crabourgeon":"Capture sauvage : Détroit argenté, Crête des crocs, Voie de béryl et Grève d'échoflux.","Crabiflore":"Capture sauvage : Détroit argenté, Voie de béryl, Grève d'échoflux et Côte de maréeflore. Peut aussi évoluer depuis Crabourgeon.","Cristocrabe":"Ne se trouve pas normalement à l'état sauvage : évolution de Crabourgeon. Peut également apparaître sous forme Alpha.","Farfafeu":"Capture sauvage : Crête des crocs, Voie de béryl, Forêt des foudres et Pré-aux-frimas.","Flamirage":"Capture sauvage : Crête des crocs, Voie de béryl, Pré-aux-frimas et Bois brumeux. Peut aussi évoluer depuis Farfafeu.","Fluoretti":"Capture sauvage : Crête des crocs, Forêt des foudres, Bois brumeux et Champs de Cumulaine.","Voletti":"Capture sauvage : Crête des crocs et Forêt des foudres. Peut aussi évoluer depuis Fluoretti.","Vitti":"Capture sauvage. Les données actuelles ne donnent pas encore une liste de zones suffisamment stable pour l'afficher ici.","Eko":"Capture sauvage : Forêt des météores.","Ekolombo":"Capture sauvage : Forêt des météores. Peut aussi évoluer depuis Eko.","Bourgeonnet":"Capture sauvage : Bois de la tour-aux-roses et Mer florale.","Rapiéronce":"Capture sauvage : Bois de la tour-aux-roses et Mer florale. Peut aussi évoluer depuis Bourgeonnet.","Méliflore":"Capture sauvage : Bois de la tour-aux-roses. Peut aussi évoluer depuis Bourgeonnet.","Pomœuf":"Capture sauvage : Crête des crocs, Pré-aux-frimas, Forêt des météores et Bois de la tour-aux-roses.","Pomawk":"Capture sauvage : Bois de la tour-aux-roses. Peut aussi évoluer depuis Pomœuf.","Plumiel":"Capture sauvage : Bois de la tour-aux-roses et Mer florale.","Fragrancier":"Capture sauvage : Mer florale. Peut aussi évoluer depuis Plumiel.","Flammi":"Capture sauvage : Voie de béryl, Forêt des foudres, Bois brumeux et Isthme du zéphyr.","Igniti":"Capture sauvage : Voie de béryl, Forêt des foudres, Bois brumeux et Isthme du zéphyr. Peut aussi évoluer depuis Flammi.","Osky":"Capture sauvage : Crête des crocs, Pré-aux-frimas et Bois de la tour-aux-roses.","Glaivrier":"Capture sauvage : Crête des crocs, Pré-aux-frimas et Bois de la tour-aux-roses. Peut aussi évoluer depuis Osky.","Molosabre":"Capture sauvage : Crête des crocs et Bois de la tour-aux-roses. Peut aussi évoluer depuis Glaivrier.","Voltige":"Capture sauvage : Forêt des foudres.","Voltignasse":"Capture sauvage : Forêt des foudres. Peut aussi évoluer depuis Voltige.","Écurixe":"Capture sauvage : Forêt des foudres.","Écurouste":"Capture sauvage : Forêt des foudres. Peut aussi évoluer depuis Écurixe.","Louloutre":"Capture sauvage : Grève d'échoflux.","Bulloutre":"Capture sauvage : Grève d'échoflux. Peut aussi évoluer depuis Louloutre.","Ondeloutre":"Ne se trouve pas à l'état sauvage : évolution de Bulloutre.","Terriloutre":"Capture sauvage : Grève d'échoflux. Peut aussi évoluer depuis Bulloutre.","Astrid":"Capture sauvage : Crescent Bay et Grève d'échoflux.","Astor":"Capture sauvage : Grève d'échoflux. Peut aussi évoluer depuis Astrid.","Astrophel":"Capture sauvage : Grève d'échoflux. Peut aussi évoluer depuis Astor.","Balabée":"Capture sauvage : Voie de béryl et Hautes-plaines ocres.","Coléobée":"Capture sauvage : Voie de béryl et Hautes-plaines ocres. Peut aussi évoluer depuis Balabée.","Boulabée":"Capture sauvage : Voie de béryl. Peut aussi évoluer depuis Balabée.","Touffu":"Capture sauvage : Pré-aux-frimas et Mer florale.","Fulgucrin":"Capture sauvage : Pré-aux-frimas. Peut aussi évoluer depuis Touffu.","Casquimou":"Capture sauvage : Hautes-plaines ocres.","Casquipreux":"Ne se trouve pas à l'état sauvage : évolution de Casquimou.","Casquillon":"Capture sauvage : Hautes-plaines ocres. Peut aussi évoluer depuis Casquimou.","Machou":"Capture sauvage : Hautes-plaines ocres.","Casquimord":"Capture sauvage : Hautes-plaines ocres. Peut aussi évoluer depuis Machou.","Cuiragon":"Capture sauvage : Hautes-plaines ocres. Peut aussi évoluer depuis Casquimord.","Infergon":"Ne se trouve pas à l'état sauvage : évolution de Casquimord.","Ourso":"Capture sauvage : Bois de la tour-aux-roses.","Grizzo":"Capture sauvage : Bois de la tour-aux-roses. Peut aussi évoluer depuis Ourso.","Silexodon":"Capture sauvage : Champs de Cumulaine et Isthme du zéphyr.","Lavasaure":"Capture sauvage : Isthme du zéphyr.","Magmarex":"Capture sauvage : Isthme du zéphyr. Peut aussi évoluer depuis Lavasaure.","Géodosaure":"Ne se trouve pas à l'état sauvage : évolution de Silexodon.","Cristorex":"Ne se trouve pas normalement à l'état sauvage : évolution de Géodosaure. Peut également apparaître sous forme Alpha.","Cabaroc":"Capture sauvage : Isthme du zéphyr.","Bastiroc":"Capture sauvage : Isthme du zéphyr. Peut aussi évoluer depuis Cabaroc.","Bulbi":"Capture sauvage : Côte de maréeflore.","Voilueur":"Capture sauvage : Côte de maréeflore. Peut aussi évoluer depuis Bulbi.","Luminelle":"Capture sauvage : Côte de maréeflore. Peut aussi évoluer depuis Voilueur.","Falou":"Capture sauvage : Côte de maréeflore.","Fabulle":"Capture sauvage : Côte de maréeflore. Peut aussi évoluer depuis Falou.","Pulsato":"Capture sauvage.","Reefish":"Données de bêta : capture sauvage, notamment à Crescent Bay. Disponibilité et zones du build de lancement à vérifier.","Coraliz":"Données de bêta : capture sauvage. Disponibilité et zones du build de lancement à vérifier.","Cheekie":"Données de bêta : capture sauvage. Disponibilité et zones du build de lancement à vérifier.","Wavwal":"Données de bêta : capture sauvage. Disponibilité et zones du build de lancement à vérifier.","Bubbeep":"Données de bêta : capture sauvage. Disponibilité et zones du build de lancement à vérifier.","Glameep":"Données de bêta : capture sauvage. Disponibilité et zones du build de lancement à vérifier.","Popapus":"Données de bêta : capture sauvage. Disponibilité et zones du build de lancement à vérifier.","Gachapus":"Données de bêta : capture sauvage. Disponibilité et zones du build de lancement à vérifier.","Malangel":"Données de bêta : capture sauvage, notamment à Crescent Bay. Disponibilité et zones du build de lancement à vérifier.","Malevsera":"Données de bêta : capture sauvage, notamment à Crescent Bay. Disponibilité et zones du build de lancement à vérifier.","Jabster":"Méthode d'obtention non documentée dans les données actuelles.","Morphling":"Méthode d'obtention non documentée dans les données actuelles.","Lumiris":"Légendaire : obtenez des Jetons légendaires en explorant et en avançant l'histoire, fabriquez l'Aniipod légendaire, débloquez son histoire exclusive puis remportez sa rencontre scriptée pour le capturer. Rencontre unique.","Danzard":"Ne se trouve pas à l'état sauvage : évolution de Pomœuf. Débloquez l'évolution via les missions de l'événement Découverte d'Aniimo, puis faites évoluer Pomœuf au niveau 25 avec une Pierre de rugissement.","Fulmi":"Ne se trouve pas à l'état sauvage : évolution spéciale de Flammi.","Elfe solidaire":"Capture sauvage.","Lunara":"Choix de compagnon de départ pendant la quête d'ouverture : vous pouvez conserver Lunara ou Hélion.","Hélion":"Choix de compagnon de départ pendant la quête d'ouverture : vous pouvez conserver Hélion ou Lunara."};
var PARTNER_BUCKETS={"Voilotus":["Iris","Valsiris","Fredon","Nutrion","Vitti","Pomœuf","Pomawk"],"Flamirage":["Loufeuteau","Jappardent","Hurlebrasier","Infergon","Lavasaure","Magmarex"],"Fragrancier":["Inferlupin","Célestia","Stellaria","Casquimou","Casquipreux","Casquillon"],"Givrotus":["Cheekie","Wavwal","Bubbeep","Glameep","Malangel","Malevsera"],"Hexxin":["Inferlupin","Célestia","Stellaria","Casquimou","Casquipreux","Casquillon"],"Astrophel":["Tilotus","Filoutus","Givrotus","Ondeloutre","Falou","Fabulle"],"Bastiroc":["Crabourgeon","Crabiflore","Ourso","Grizzo"],"Grizzo":["Cabaroc","Bastiroc","Reefish","Coraliz"],"Voltignasse":["Bulbi","Voilueur","Luminelle"],"Danzard":["Touffu","Fulgucrin","Fulmi"],"Ekolombo":["Machou","Casquimord","Cuiragon"],"Fabulle":["Louloutre","Bulloutre","Terriloutre"],"Cristocrabe":["Osky","Glaivrier","Molosabre"],"Cuiragon":["Turbulaine","Eko","Ekolombo"],"Ondeloutre":["Astrid","Astor","Astrophel"],"Hurlebrasier":["Farfafeu","Flamirage","Vitti"],"Stellaria":["Hexxin","Plumiel","Fragrancier"],"Clairbec":["Cuicui","Trombec"],"Lainirique":["Flammi","Igniti"],"Fulgucrin":["Pulsato","Danzard"],"Luminelle":["Voltige","Voltignasse"],"Magmarex":["Farfafeu","Flamirage"],"Méliflore":["Bourgeonnet","Rapiéronce"],"Vitti":["Hurlebrasier","Lumiris"],"Trombec":["Clairbec","Tubabec"],"Coléobée":["Boulabée","Géodosaure"],"Wavwal":["Popapus","Gachapus"]};
var EXTRA_PARTNERS={"Voilotus":["Valsiris"],"Cristocrabe":["Molosabre"],"Méliflore":["Rapiéronce"],"Coléobée":["Boulabée"],"Cumulaine":["Machou"],"Lainirique":["Casquipreux"],"Fluoretti":["Fluoretti"],"Voletti":["Voletti"],"Balabée":["Balabée"],"Turbulaine":["Bulbi"]};
var BETA_ONLY=["Reefish","Coraliz","Cheekie","Wavwal","Bubbeep","Glameep","Popapus","Gachapus","Malangel","Malevsera"];
var NAME_ALIASES={"Sorcelonde":"Hexxin","Somniwing":"Vitti","Irisalis":"Lumiris","Petit Esprit de Feu":"Elfe solidaire"};
var ANIIMO=CATALOG.map(function(c){return c.name;});
var NUMBERS={};CATALOG.forEach(function(c){if(c.no)NUMBERS[c.name]=c.no;});
var PARTNERS={};Object.keys(PARTNER_BUCKETS).forEach(function(partner){PARTNER_BUCKETS[partner].forEach(function(name){if(!PARTNERS[name])PARTNERS[name]=[];if(PARTNERS[name].indexOf(partner)<0)PARTNERS[name].push(partner);});});Object.keys(EXTRA_PARTNERS).forEach(function(name){if(!PARTNERS[name])PARTNERS[name]=[];EXTRA_PARTNERS[name].forEach(function(p){if(PARTNERS[name].indexOf(p)<0)PARTNERS[name].push(p);});});
function creatureImage(slug){return slug?"https://aniimotools.dev/assets/creatures/"+slug+".webp":"";}
var DETAILS={};CATALOG.forEach(function(c){DETAILS[c.name]={no:c.no||"",slug:c.slug,image:creatureImage(c.slug),elements:c.elements||[],role:c.role||"",stats:c.stats||null,obtain:OBTAIN[c.name]||"Méthode d'obtention à documenter.",partners:PARTNERS[c.name]||[],beta:BETA_ONLY.indexOf(c.name)>-1,source:"https://aniimotools.dev/fr/creatures/"+c.slug+"/",summary:"Aniimo "+(c.role||"au rôle non documenté")+" de type "+((c.elements&&c.elements.length)?c.elements.join("/"):"non documenté")+". Cette fiche rassemble ses données de base, son obtention et les duos recommandés par les données du jeu.",habitat:"—",mobility:"—",pathfinding:"—",trait:"—"};});
var RICH={"Crabiflore":{"habitat":"Voie de béryl","mobility":"Tunnel","pathfinding":"—","trait":"Retour d'embuscade","summary":"Briseur Terre/Plante très robuste : il excelle à créer une fenêtre de rupture tout en encaissant grâce à sa forte DÉFP."},"Pomawk":{"habitat":"Bois de la tour-aux-roses","mobility":"—","pathfinding":"—","trait":"Accord","summary":"Briseur Plante/Glace qui récompense le bon timing et l'accumulation de Volume pour accélérer la rupture."},"Igniti":{"habitat":"Voie de béryl","mobility":"Dissimulation","pathfinding":"Voler Lv.2","trait":"Ferveur du combat","summary":"DPS mobile et agressif, pensé pour enchaîner rapidement les cibles et exploiter les fenêtres de dégâts."},"Écurouste":{"habitat":"Forêt des foudres","mobility":"—","pathfinding":"Grimper Lv.2","trait":"Feu déchaîné","summary":"Briseur Feu très solide, avec une excellente RUPTURE et des attaques renforcées après ses compétences."},"Boulabée":{"habitat":"Voie de béryl","mobility":"Boule déferlante","pathfinding":"—","trait":"Renforcement rocheux","summary":"Soutien Terre/Glace qui prépare le terrain et apporte de l'utilité à l'équipe plutôt que du burst pur."},"Infergon":{"habitat":"—","mobility":"Bilatéral","pathfinding":"Voler Lv.2","trait":"Pouvoir du feu","summary":"DPS Feu/Vent aérien qui devient particulièrement dangereux quand les conditions de son kit sont en place."},"Magmarex":{"habitat":"Isthme du zéphyr","mobility":"Fast and Furious","pathfinding":"—","trait":"Charge pyro","summary":"Briseur massif Feu/Terre, très endurant et performant pour faire tomber rapidement la jauge de rupture."},"Pulsato":{"habitat":"—","mobility":"—","pathfinding":"—","trait":"Surtension électrique","summary":"Régénérateur Foudre centré sur la gestion des PE et la cadence de compétences de l'équipe."}};Object.keys(RICH).forEach(function(name){if(DETAILS[name])Object.assign(DETAILS[name],RICH[name]);});
var APP_URL="https://tfortun-dev.github.io/test/";
var STORAGE_KEY="aniimo-carnet-idyll-v2";
var SB_URL="https://eukjpxrqdzpvihzxpjtb.supabase.co";
var SB_KEY="sb_publishable_P3jFs6AJphD_T65Lq69qgQ_cidOkGjk";
var SB_SESSION_KEY="aniimo-supabase-session-v1";
var LEGACY_KEY="aniimo-carnet-idyll-v1";
var SYNC_KEY="aniimo-github-sync-v1";
var CLOUD_REPO="tfortun-dev/test";
var CLOUD_PATH="aniimo-data/save.enc.json";
var API="https://api.github.com";
var filter="all";
var state=loadState();
var cloudBusy=false,cloudTimer=null,pollTimer=null,runtimeToken="",runtimePassphrase="";
var sbBusy=false,sbTimer=null,sbPollTimer=null,sbSession=loadSbSession();

function q(s){return document.querySelector(s);}
function qa(s){return Array.prototype.slice.call(document.querySelectorAll(s));}
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function norm(v){return String(v==null?"":v).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
function emptyState(){return {version:3,updatedAt:0,caught:[],wanted:PRIORITIES.slice(),entries:[],analysis:{}};}
function sanitize(data){
  var base=emptyState(),d=data&&typeof data==="object"?data:{};
  base.updatedAt=Number(d.updatedAt)||0;
  base.caught=Array.from(new Set((Array.isArray(d.caught)?d.caught:[]).map(function(n){return NAME_ALIASES[n]||n;}).filter(function(n){return ANIIMO.indexOf(n)>-1;})));
  base.wanted=Array.from(new Set((Array.isArray(d.wanted)?d.wanted:PRIORITIES).map(function(n){return NAME_ALIASES[n]||n;}).filter(function(n){return ANIIMO.indexOf(n)>-1;})));
  base.entries=(Array.isArray(d.entries)?d.entries:[]).filter(Boolean).map(function(e){
    return {id:String(e.id||Date.now()+Math.random()),date:String(e.date||""),title:String(e.title||""),area:String(e.area||""),aniimo:ANIIMO.indexOf(e.aniimo)>-1?e.aniimo:"",text:String(e.text||""),created:Number(e.created)||Date.now(),modified:Number(e.modified)||Number(e.created)||Date.now()};
  });
  base.analysis={};
  var srcAnalysis=d.analysis&&typeof d.analysis==="object"?d.analysis:{};
  Object.keys(NAME_ALIASES).forEach(function(oldName){if(srcAnalysis[oldName]&&!srcAnalysis[NAME_ALIASES[oldName]])srcAnalysis[NAME_ALIASES[oldName]]=srcAnalysis[oldName];});
  ANIIMO.forEach(function(name){
    var a=srcAnalysis[name];
    if(!a||typeof a!=="object")return;
    base.analysis[name]={
      seen:!!a.seen,analysed:!!a.analysed,trained:!!a.trained,
      form:String(a.form||""),encounter:String(a.encounter||""),conditions:String(a.conditions||""),
      strengths:String(a.strengths||""),weaknesses:String(a.weaknesses||""),strategy:String(a.strategy||""),
      notes:String(a.notes||""),modified:Number(a.modified)||0
    };
  });
  return base;
}
function loadState(){
  try{
    var raw=localStorage.getItem(STORAGE_KEY);
    if(raw)return sanitize(JSON.parse(raw));
    raw=localStorage.getItem(LEGACY_KEY);
    if(raw){
      var migrated=sanitize(JSON.parse(raw));
      migrated.updatedAt=Date.now();
      localStorage.setItem(STORAGE_KEY,JSON.stringify(migrated));
      return migrated;
    }
  }catch(e){console.warn(e);}
  return emptyState();
}
function saveLocal(touch,sync){
  if(touch!==false)state.updatedAt=Date.now();
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){console.warn(e);}
  renderStats();
  if(sync!==false){schedulePush();scheduleSupabasePush();}
}
function caught(n){return state.caught.indexOf(n)>-1;}
function wanted(n){return state.wanted.indexOf(n)>-1;}
function toast(t){var e=q("#toast");if(!e)return;e.textContent=t;e.classList.add("on");clearTimeout(toast.timer);toast.timer=setTimeout(function(){e.classList.remove("on");},1800);}
function go(v){
  qa(".tab").forEach(function(b){b.classList.toggle("on",b.getAttribute("data-view")===v);});
  qa(".view").forEach(function(x){x.classList.toggle("on",x.id===v);});
  if(v==="dex")renderDex();
  if(v==="journal")renderEntries();
  if(v==="save")renderSyncUi();
  window.scrollTo({top:0,behavior:"smooth"});
}
function renderStats(){
  var c=state.caught.length,p=PRIORITIES.filter(caught).length;
  var analysed=Object.keys(state.analysis||{}).filter(function(n){return state.analysis[n]&&state.analysis[n].analysed;}).length;
  if(q("#score"))q("#score").textContent=c+"/"+ANIIMO.length;
  if(q("#bar"))q("#bar").style.width=Math.round(c/ANIIMO.length*100)+"%";
  if(q("#prioScore"))q("#prioScore").textContent=p+"/8 priorités obtenues";
  if(q("#sCaught"))q("#sCaught").textContent=c;
  if(q("#sWanted"))q("#sWanted").textContent=state.wanted.length;
  if(q("#sAnalyzed"))q("#sAnalyzed").textContent=analysed;
  if(q("#sEntries"))q("#sEntries").textContent=state.entries.length;
}
function toggleCaught(n){
  state.caught=caught(n)?state.caught.filter(function(x){return x!==n;}):state.caught.concat(n);
  saveLocal();renderTargets();renderDex();renderRecent();toast(caught(n)?n+" capturé":n+" retiré");
}
function toggleWanted(n){
  state.wanted=wanted(n)?state.wanted.filter(function(x){return x!==n;}):state.wanted.concat(n);
  saveLocal();renderDex();toast(wanted(n)?n+" ajouté aux favoris":n+" retiré des favoris");
}
function analysisFor(n){
  var a=state.analysis&&state.analysis[n];
  return a||{seen:false,analysed:false,trained:false,form:"",encounter:"",conditions:"",strengths:"",weaknesses:"",strategy:"",notes:"",modified:0};
}
function analysisMethod(role){
  var r=String(role||"").toUpperCase();
  if(r==="DPS")return "Teste d'abord le burst sur une fenêtre de rupture, puis les dégâts soutenus sur 30 à 60 s. Note la facilité à appliquer sa rotation, sa dépendance aux conditions de son trait, sa mobilité et la perte de DPS quand la cible bouge.";
  if(r==="BREAK"||r==="RUPT."||r==="RUPT")return "Mesure le temps nécessaire pour casser une même cible avec un niveau comparable. Note le coût en PE, la facilité à toucher, la sécurité pendant l'animation et la qualité de la fenêtre de dégâts créée après la rupture.";
  if(r==="SOUTIEN"||r==="ASSISTANCE"||r==="SUPPORT")return "Observe la valeur apportée aux trois autres membres : buffs, débuffs, contrôle et durée d'effet. Teste surtout le temps d'activation, l'uptime et si le partenaire recommandé déclenche réellement une synergie plus forte.";
  if(r==="SOIN"||r==="HEAL")return "Mesure la quantité de PV rendue sur une rotation, la portée, le délai avant le soin et la facilité à sauver plusieurs alliés. Vérifie aussi ce qu'il apporte quand personne n'a besoin d'être soigné.";
  if(r==="RÉGÉN"||r==="RÉGÉN."||r==="REGEN")return "Suis la génération de PE sur une rotation complète : fréquence des compétences, temps morts et capacité à maintenir le rythme de toute l'équipe. Compare avec et sans le partenaire recommandé.";
  return "Teste ses compétences sur une cible stable puis mobile, note son rôle réel, ses contraintes, sa mobilité et ce qui change avec son partenaire recommandé. Utilise tes observations pour préciser cette fiche.";
}
function renderTargets(){
  var root=q("#targets");if(!root)return;
  root.innerHTML=PRIORITIES.map(function(n){
    var d=DETAILS[n]||{},a=analysisFor(n);
    return '<article class="target '+(caught(n)?"done":"")+'">'+
      '<button class="targetvisual" type="button" data-detail="'+esc(n)+'" aria-label="Voir la fiche de '+esc(n)+'"><img src="'+esc(d.image||"")+'" alt="'+esc(n)+'" loading="lazy" onerror="this.style.display=\'none\'"></button>'+
      '<div class="targetbody"><small>#'+NUMBERS[n]+' · '+esc(d.role||"priorité")+'</small><b>'+esc(n)+'</b>'+
      '<div class="minitags">'+(d.elements||[]).map(function(x){return '<span>'+esc(x)+'</span>';}).join("")+'</div>'+
      '<div class="targetprogress"><span class="'+(a.seen?"ok":"")+'">Vu</span><span class="'+(a.analysed?"ok":"")+'">Analysé</span><span class="'+(caught(n)?"ok":"")+'">Capturé</span></div>'+
      '<div class="targetactions"><button class="smallbtn" type="button" data-catch="'+esc(n)+'">'+(caught(n)?"✓ Capturé":"Marquer capturé")+'</button><button class="smallbtn ghost" type="button" data-detail="'+esc(n)+'">Fiche</button></div></div></article>';
  }).join("");
}
function renderDex(){
  var root=q("#dexGrid"),search=q("#search");if(!root||!search)return;
  var needle=norm(search.value.trim()),list=ANIIMO.filter(function(n){return !needle||norm(n).indexOf(needle)>-1;});
  if(filter==="wanted")list=list.filter(wanted);
  if(filter==="caught")list=list.filter(caught);
  if(filter==="missing")list=list.filter(function(n){return !caught(n);});
  if(!list.length){root.innerHTML='<div class="empty">Aucun Aniimo ne correspond à ce filtre.</div>';return;}
  root.innerHTML=list.map(function(n){
    var d=DETAILS[n]||{},a=analysisFor(n),visual=d.image?'<span class="thumbwrap"><img class="anithumb" src="'+esc(d.image)+'" alt="" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="anithumb placeholder" hidden>'+esc(n.charAt(0))+'</span></span>':'<span class="anithumb placeholder">'+esc(n.charAt(0))+'</span>';
    return '<article class="ani '+(caught(n)?"caught ":"")+(wanted(n)?"wanted":"")+'">'+visual+
      '<input class="check" type="checkbox" aria-label="Capturé '+esc(n)+'" data-dex="'+esc(n)+'" '+(caught(n)?"checked":"")+'>'+
      '<div class="aniname"><b>'+esc(n)+'</b><small>'+(d.no?"#"+esc(d.no)+" · ":"")+(d.role?esc(d.role):"rôle non documenté")+(a.analysed?" · analysé":"")+'</small></div>'+
      '<button class="infobtn" type="button" data-detail="'+esc(n)+'" aria-label="Voir la fiche de '+esc(n)+'">i</button>'+
      '<button class="star '+(wanted(n)?"on":"")+'" type="button" data-star="'+esc(n)+'" aria-label="Favori '+esc(n)+'">★</button></article>';
  }).join("");
}

function setField(id,value){var el=q(id);if(el)el.value=value||"";}
function openDetail(name){
  var modal=q("#aniimoModal");if(!modal)return;
  var d=DETAILS[name]||{},a=analysisFor(name);
  modal.setAttribute("data-name",name);
  q("#detailName").textContent=name;
  q("#detailNo").textContent=d.no?"NO."+d.no:"Carnet personnel";
  q("#detailRole").textContent=d.role||"À documenter";
  q("#detailElements").innerHTML=(d.elements||[]).map(function(x){return '<span>'+esc(x)+'</span>';}).join("");
  var img=q("#detailImage"),ph=q("#detailPlaceholder");
  img.onload=function(){img.hidden=false;ph.hidden=true;};img.onerror=function(){img.hidden=true;ph.hidden=false;ph.textContent=name.charAt(0);};
  if(d.image){img.src=d.image;img.alt=name;}else{img.hidden=true;ph.hidden=false;ph.textContent=name.charAt(0);}
  q("#detailSummary").textContent=d.summary||"Cette fiche est prête à être enrichie avec tes propres observations.";
  q("#detailHabitat").textContent=d.habitat||"—";
  q("#detailMobility").textContent=d.mobility||"—";
  q("#detailPath").textContent=d.pathfinding||"—";
  q("#detailTrait").textContent=d.trait||"—";
  q("#detailMethod").textContent=analysisMethod(d.role||"");
  if(q("#detailObtain"))q("#detailObtain").textContent=d.obtain||"Méthode d'obtention à documenter.";
  if(q("#detailPartners")){
    q("#detailPartners").innerHTML=(d.partners&&d.partners.length)?d.partners.map(function(p){return '<button type="button" class="partnerpill" data-detail="'+esc(p)+'">'+esc(p)+'</button>';}).join(""):'<span class="partnerempty">Aucun partenaire idéal n’est renseigné dans les données actuelles du jeu.</span>';
  }
  if(q("#detailAvailability")){
    q("#detailAvailability").hidden=!d.beta;
    q("#detailAvailability").textContent=d.beta?"Donnée issue de la bêta : disponibilité et conditions du build de lancement à vérifier.":"";
  }
  var s=d.stats||{};
  q("#detailStats").innerHTML=d.stats?'<span>PV <b>'+s.pv+'</b></span><span>RUPT. <b>'+s.rupt+'</b></span><span>ATQ <b>'+s.atq+'</b></span><span>DÉF M. <b>'+s.defm+'</b></span><span>DÉF P. <b>'+s.defp+'</b></span><span>RÉGÉN. <b>'+s.regen+'</b></span>':'<span>Données officielles à ajouter</span>';
  var src=q("#detailSource");src.hidden=!d.source;if(d.source)src.href=d.source;
  q("#aSeen").checked=!!a.seen;q("#aAnalysed").checked=!!a.analysed;q("#aCaught").checked=caught(name);q("#aTrained").checked=!!a.trained;
  setField("#aForm",a.form);setField("#aEncounter",a.encounter);setField("#aConditions",a.conditions);
  setField("#aStrengths",a.strengths);setField("#aWeaknesses",a.weaknesses);setField("#aStrategy",a.strategy);setField("#aNotes",a.notes);
  modal.classList.add("open");modal.setAttribute("aria-hidden","false");document.body.classList.add("modalopen");
}
function closeDetail(){
  var modal=q("#aniimoModal");if(!modal)return;modal.classList.remove("open");modal.setAttribute("aria-hidden","true");document.body.classList.remove("modalopen");
}
function saveAnalysis(){
  var modal=q("#aniimoModal"),name=modal&&modal.getAttribute("data-name");if(!name)return;
  state.analysis=state.analysis||{};
  state.analysis[name]={
    seen:q("#aSeen").checked,analysed:q("#aAnalysed").checked,trained:q("#aTrained").checked,
    form:q("#aForm").value.trim(),encounter:q("#aEncounter").value.trim(),conditions:q("#aConditions").value.trim(),
    strengths:q("#aStrengths").value.trim(),weaknesses:q("#aWeaknesses").value.trim(),strategy:q("#aStrategy").value.trim(),
    notes:q("#aNotes").value.trim(),modified:Date.now()
  };
  if(q("#aCaught").checked&&!caught(name))state.caught.push(name);
  if(!q("#aCaught").checked&&caught(name))state.caught=state.caught.filter(function(x){return x!==name;});
  saveLocal();renderTargets();renderDex();renderRecent();toast("Analyse de "+name+" enregistrée");
}

function renderOptions(){
  var el=q("#linked");if(!el)return;var current=el.value;
  el.innerHTML='<option value="">— aucun —</option>'+ANIIMO.map(function(n){return '<option value="'+esc(n)+'">'+esc(n)+'</option>';}).join("");
  if(ANIIMO.indexOf(current)>-1)el.value=current;
}
function sortedEntries(){return state.entries.slice().sort(function(a,b){return (b.date||"").localeCompare(a.date||"")||(b.modified||b.created||0)-(a.modified||a.created||0);});}
function renderEntries(){
  var root=q("#entries");if(!root)return;var list=sortedEntries();
  if(!list.length){root.innerHTML='<div class="empty">Ton journal est vide.</div>';return;}
  root.innerHTML=list.map(function(e){
    return '<article class="entry"><div class="entrytop"><div><h3>'+esc(e.title)+'</h3><div class="meta">'+esc(e.date||"")+(e.area?" · "+esc(e.area):"")+(e.aniimo?" · "+esc(e.aniimo):"")+'</div></div><div class="actions"><button class="icon" type="button" data-edit="'+esc(e.id)+'">✎</button><button class="icon" type="button" data-del="'+esc(e.id)+'">×</button></div></div><p>'+esc(e.text)+'</p></article>';
  }).join("");
}
function renderRecent(){
  var root=q("#recent");if(!root)return;var list=sortedEntries().slice(0,3);
  if(!list.length){root.innerHTML='<div class="empty">Pas encore de note. Ton premier souvenir apparaîtra ici.</div>';return;}
  root.innerHTML='<div class="entries">'+list.map(function(e){var t=esc(e.text);return '<article class="entry"><h3>'+esc(e.title)+'</h3><div class="meta">'+esc(e.date||"")+(e.aniimo?" · "+esc(e.aniimo):"")+'</div><p>'+t.slice(0,220)+(t.length>220?"…":"")+'</p></article>';}).join("")+'</div>';
}
function resetForm(){
  var form=q("#form");if(!form)return;form.reset();q("#eid").value="";q("#date").value=new Date().toISOString().slice(0,10);q("#cancel").hidden=true;
}
function editEntry(id){
  var e=state.entries.find(function(x){return x.id===id;});if(!e)return;go("journal");
  q("#eid").value=e.id;q("#date").value=e.date||"";q("#title").value=e.title||"";q("#area").value=e.area||"";q("#linked").value=e.aniimo||"";q("#text").value=e.text||"";q("#cancel").hidden=false;q("#title").focus();
}
function submitJournal(ev){
  ev.preventDefault();var id=q("#eid").value,old=state.entries.find(function(x){return x.id===id;}),now=Date.now();
  var e={id:id||String(now)+Math.random().toString(16).slice(2),date:q("#date").value,title:q("#title").value.trim(),area:q("#area").value.trim(),aniimo:q("#linked").value,text:q("#text").value.trim(),created:old?old.created:now,modified:now};
  if(!e.title||!e.text)return;
  state.entries=old?state.entries.map(function(x){return x.id===id?e:x;}):state.entries.concat(e);
  saveLocal();renderEntries();renderRecent();resetForm();toast(old?"Entrée modifiée":"Entrée ajoutée");
}
function exportJson(){
  var blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download="aniimo-carnet-"+new Date().toISOString().slice(0,10)+".json";a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},500);toast("Sauvegarde exportée");
}
function importJson(ev){
  var file=ev.target.files&&ev.target.files[0];if(!file)return;var r=new FileReader();
  r.onload=function(){try{state=sanitize(JSON.parse(r.result));state.updatedAt=Date.now();saveLocal();renderAll();toast("Sauvegarde importée");}catch(e){alert("Fichier de sauvegarde invalide.");}ev.target.value="";};r.readAsText(file);
}
function syncCfg(){
  try{var c=JSON.parse(localStorage.getItem(SYNC_KEY)||"{}");return {remember:c.remember!==false,token:String(c.token||""),passphrase:String(c.passphrase||"")};}
  catch(e){return {remember:true,token:"",passphrase:""};}
}
function saveSyncCfg(){
  var remember=q("#rememberSync")?q("#rememberSync").checked:true;
  localStorage.setItem(SYNC_KEY,JSON.stringify({remember:remember,token:remember?runtimeToken:"",passphrase:remember?runtimePassphrase:""}));
}
function setStatus(text,kind){
  var el=q("#syncStatus");if(!el)return;el.textContent=text;el.className="syncstatus"+(kind?" "+kind:"");
}
function renderSyncUi(){
  var email=q("#cloudEmail"),account=q("#cloudAccount");
  if(sbSession&&sbSession.user){
    if(email&&!email.value)email.value=sbSession.user.email||"";
    if(account)account.textContent=sbSession.user.email||"Compte connecté";
    setStatus("Cloud connecté · synchro automatique active","ok");
  }else{
    if(account)account.textContent="Aucun compte connecté";
    setStatus("À connecter une fois par appareil","");
  }
}
function b64(bytes){var s="";for(var i=0;i<bytes.length;i++)s+=String.fromCharCode(bytes[i]);return btoa(s);}
function unb64(s){var bin=atob(s),out=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out;}
function textB64(text){return b64(new TextEncoder().encode(text));}
function b64Text(s){return new TextDecoder().decode(unb64(s));}
async function derive(pass,salt){
  var material=await crypto.subtle.importKey("raw",new TextEncoder().encode(pass),"PBKDF2",false,["deriveKey"]);
  return crypto.subtle.deriveKey({name:"PBKDF2",salt:salt,iterations:180000,hash:"SHA-256"},material,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
}
async function encryptData(data,pass){
  var salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12)),key=await derive(pass,salt),plain=new TextEncoder().encode(JSON.stringify(data));
  var enc=await crypto.subtle.encrypt({name:"AES-GCM",iv:iv},key,plain);
  return {format:"aniimo-encrypted-save",version:1,salt:b64(salt),iv:b64(iv),data:b64(new Uint8Array(enc))};
}
async function decryptData(env,pass){
  if(!env||env.format!=="aniimo-encrypted-save")throw new Error("Format de sauvegarde inconnu.");
  var salt=unb64(env.salt),iv=unb64(env.iv),key=await derive(pass,salt),plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:iv},key,unb64(env.data));
  return sanitize(JSON.parse(new TextDecoder().decode(plain)));
}
async function gh(url,opt){
  opt=opt||{};var headers=Object.assign({"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"},opt.headers||{});
  if(runtimeToken)headers.Authorization="Bearer "+runtimeToken;
  return fetch(url,Object.assign({},opt,{headers:headers}));
}
async function getCloud(){
  var res=await gh(API+"/repos/"+CLOUD_REPO+"/contents/"+CLOUD_PATH+"?ref=main&t="+Date.now());
  if(res.status===404)return null;
  if(!res.ok)throw new Error("GitHub "+res.status+" · "+(await res.text()).slice(0,180));
  var d=await res.json();return {sha:d.sha,text:b64Text(String(d.content||"").replace(/\n/g,""))};
}
async function putCloud(env,sha){
  if(!runtimeToken)throw new Error("Token GitHub manquant.");
  var body={message:"Sync Aniimo companion",content:textB64(JSON.stringify(env)),branch:"main"};if(sha)body.sha=sha;
  var res=await gh(API+"/repos/"+CLOUD_REPO+"/contents/"+CLOUD_PATH,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  if(!res.ok)throw new Error("GitHub "+res.status+" · "+(await res.text()).slice(0,180));
  return res.json();
}
async function syncCloud(forcePush,silent){
  if(cloudBusy||!runtimeToken||!runtimePassphrase){if(!silent&&!cloudBusy)setStatus("Configuration incomplète","err");return;}
  cloudBusy=true;if(!silent)setStatus("Synchronisation…","busy");
  try{
    var file=await getCloud();
    if(!file){await putCloud(await encryptData(state,runtimePassphrase),null);setStatus("Synchronisé · première sauvegarde créée","ok");if(!silent)toast("Sauvegarde GitHub créée");return;}
    var remote;
    try{remote=await decryptData(JSON.parse(file.text),runtimePassphrase);}catch(e){throw new Error("Clé de chiffrement incorrecte ou sauvegarde illisible.");}
    if(!forcePush&&remote.updatedAt>state.updatedAt){state=remote;saveLocal(false,false);renderAll();setStatus("Synchronisé · données GitHub récupérées","ok");if(!silent)toast("Données GitHub récupérées");}
    else if(forcePush||state.updatedAt>remote.updatedAt){await putCloud(await encryptData(state,runtimePassphrase),file.sha);setStatus("Synchronisé · GitHub à jour","ok");if(!silent)toast("GitHub mis à jour");}
    else setStatus("Synchronisé · déjà à jour","ok");
  }catch(e){console.error(e);setStatus("Erreur de synchro","err");if(!silent)alert("Synchronisation GitHub impossible.\n\n"+e.message);}
  finally{cloudBusy=false;}
}
function schedulePush(){if(!runtimeToken||!runtimePassphrase)return;clearTimeout(cloudTimer);cloudTimer=setTimeout(function(){syncCloud(true,true);},1200);}
function startPolling(){clearInterval(pollTimer);if(runtimeToken&&runtimePassphrase)pollTimer=setInterval(function(){syncCloud(false,true);},30000);}
async function connectGithub(){
  runtimeToken=(q("#githubToken").value||"").trim();runtimePassphrase=q("#syncPassphrase").value||"";
  if(!runtimeToken||runtimePassphrase.length<6){alert("Renseigne ton token GitHub et une clé de chiffrement d’au moins 6 caractères.");return;}
  saveSyncCfg();setStatus("Vérification…","busy");await syncCloud(false,false);startPolling();
}
function disconnectGithub(){
  runtimeToken="";runtimePassphrase="";localStorage.removeItem(SYNC_KEY);clearInterval(pollTimer);
  if(q("#githubToken"))q("#githubToken").value="";if(q("#syncPassphrase"))q("#syncPassphrase").value="";
  setStatus("Déconnecté · données locales conservées","");toast("Synchronisation déconnectée");
}

function loadSbSession(){
  try{return JSON.parse(localStorage.getItem(SB_SESSION_KEY)||"null");}catch(e){return null;}
}
function saveSbSession(s){
  sbSession=s||null;
  if(sbSession)localStorage.setItem(SB_SESSION_KEY,JSON.stringify(sbSession));
  else localStorage.removeItem(SB_SESSION_KEY);
  renderSyncUi();
}
async function sbFetch(path,opt){
  opt=opt||{};
  var headers=Object.assign({"apikey":SB_KEY,"Content-Type":"application/json"},opt.headers||{});
  if(sbSession&&sbSession.access_token)headers.Authorization="Bearer "+sbSession.access_token;
  return fetch(SB_URL+path,Object.assign({},opt,{headers:headers}));
}
async function refreshSbSession(){
  if(!sbSession||!sbSession.refresh_token)return false;
  var res=await fetch(SB_URL+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{"apikey":SB_KEY,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:sbSession.refresh_token})});
  if(!res.ok){saveSbSession(null);return false;}
  var d=await res.json();d.expires_at=Math.floor(Date.now()/1000)+(d.expires_in||3600);saveSbSession(d);return true;
}
async function ensureSbSession(){
  if(!sbSession)return false;
  if(!sbSession.expires_at)return true;
  if(sbSession.expires_at-Math.floor(Date.now()/1000)>60)return true;
  return refreshSbSession();
}
async function registerSupabase(){
  var email=(q("#cloudEmail").value||"").trim(),password=q("#cloudPassword").value||"";
  if(!email||password.length<6){alert("Entre ton email et un mot de passe d’au moins 6 caractères.");return;}
  setStatus("Création du compte…","busy");
  var res=await fetch(SB_URL+"/auth/v1/signup?redirect_to="+encodeURIComponent(APP_URL),{method:"POST",headers:{"apikey":SB_KEY,"Content-Type":"application/json"},body:JSON.stringify({email:email,password:password})});
  var d=await res.json();
  if(!res.ok){setStatus("Erreur de création","err");alert(d.msg||d.message||"Création du compte impossible.");return;}
  if(d.access_token){
    d.expires_at=Math.floor(Date.now()/1000)+(d.expires_in||3600);saveSbSession(d);await syncSupabase(false,false);startSupabasePolling();toast("Compte connecté");
  }else{
    setStatus("Compte créé · confirme l’email puis connecte-toi","ok");
    alert("Compte créé. Supabase peut demander de confirmer ton adresse email. Après confirmation, reviens ici et clique sur Se connecter.");
  }
}
async function loginSupabase(){
  var email=(q("#cloudEmail").value||"").trim(),password=q("#cloudPassword").value||"";
  if(!email||!password){alert("Entre ton email et ton mot de passe.");return;}
  setStatus("Connexion…","busy");
  var res=await fetch(SB_URL+"/auth/v1/token?grant_type=password",{method:"POST",headers:{"apikey":SB_KEY,"Content-Type":"application/json"},body:JSON.stringify({email:email,password:password})});
  var d=await res.json();
  if(!res.ok){setStatus("Connexion impossible","err");alert(d.error_description||d.msg||d.message||"Connexion impossible.");return;}
  d.expires_at=Math.floor(Date.now()/1000)+(d.expires_in||3600);saveSbSession(d);await syncSupabase(false,false);startSupabasePolling();toast("Cloud connecté");
}
async function logoutSupabase(){
  try{if(sbSession&&sbSession.access_token)await sbFetch("/auth/v1/logout",{method:"POST"});}catch(e){}
  saveSbSession(null);clearInterval(sbPollTimer);toast("Cloud déconnecté");
}
async function getSupabaseSave(){
  if(!await ensureSbSession())return null;
  var uid=sbSession&&sbSession.user&&sbSession.user.id;if(!uid)return null;
  var res=await sbFetch("/rest/v1/aniimo_saves?user_id=eq."+encodeURIComponent(uid)+"&select=data,updated_at",{method:"GET"});
  if(res.status===401&&await refreshSbSession())return getSupabaseSave();
  if(!res.ok)throw new Error("Supabase "+res.status+" · "+(await res.text()).slice(0,180));
  var rows=await res.json();return rows&&rows[0]?rows[0]:null;
}
async function putSupabaseSave(){
  if(!await ensureSbSession())throw new Error("Session expirée.");
  var uid=sbSession&&sbSession.user&&sbSession.user.id;if(!uid)throw new Error("Utilisateur introuvable.");
  var res=await sbFetch("/rest/v1/aniimo_saves?on_conflict=user_id",{method:"POST",headers:{"Prefer":"resolution=merge-duplicates,return=representation"},body:JSON.stringify({user_id:uid,data:state})});
  if(res.status===401&&await refreshSbSession())return putSupabaseSave();
  if(!res.ok)throw new Error("Supabase "+res.status+" · "+(await res.text()).slice(0,180));
  return res.json();
}
async function syncSupabase(forcePush,silent){
  if(sbBusy||!sbSession)return;
  sbBusy=true;if(!silent)setStatus("Synchronisation cloud…","busy");
  try{
    var remote=await getSupabaseSave();
    if(!remote){await putSupabaseSave();setStatus("Cloud synchronisé · première sauvegarde créée","ok");if(!silent)toast("Sauvegarde cloud créée");return;}
    var remoteState=sanitize(remote.data||{});
    if(!forcePush&&remoteState.updatedAt>state.updatedAt){
      state=remoteState;saveLocal(false,false);renderAll();setStatus("Cloud synchronisé · données récupérées","ok");if(!silent)toast("Données cloud récupérées");
    }else if(forcePush||state.updatedAt>remoteState.updatedAt){
      await putSupabaseSave();setStatus("Cloud synchronisé · à jour","ok");if(!silent)toast("Cloud mis à jour");
    }else setStatus("Cloud synchronisé · déjà à jour","ok");
  }catch(e){console.error(e);setStatus("Erreur cloud","err");if(!silent)alert("Synchronisation impossible.\n\n"+e.message);}
  finally{sbBusy=false;}
}
function scheduleSupabasePush(){
  if(!sbSession)return;
  clearTimeout(sbTimer);sbTimer=setTimeout(function(){syncSupabase(true,true);},900);
}
function startSupabasePolling(){
  clearInterval(sbPollTimer);
  if(sbSession)sbPollTimer=setInterval(function(){syncSupabase(false,true);},30000);
}

function renderAll(){renderStats();renderTargets();renderDex();renderEntries();renderRecent();renderOptions();renderSyncUi();}
function bind(){
  document.addEventListener("click",function(ev){
    var x=ev.target.closest("[data-view]");if(x){go(x.getAttribute("data-view"));return;}
    x=ev.target.closest("[data-go]");if(x){go(x.getAttribute("data-go"));return;}
    x=ev.target.closest("[data-catch]");if(x){toggleCaught(x.getAttribute("data-catch"));return;}
    x=ev.target.closest("[data-star]");if(x){toggleWanted(x.getAttribute("data-star"));return;}
    x=ev.target.closest("[data-detail]");if(x){openDetail(x.getAttribute("data-detail"));return;}
    x=ev.target.closest("[data-close-modal]");if(x){closeDetail();return;}
    x=ev.target.closest("[data-filter]");if(x){filter=x.getAttribute("data-filter");qa("[data-filter]").forEach(function(b){b.classList.toggle("on",b===x);});renderDex();return;}
    x=ev.target.closest("[data-edit]");if(x){editEntry(x.getAttribute("data-edit"));return;}
    x=ev.target.closest("[data-del]");if(x&&confirm("Supprimer cette entrée ?")){state.entries=state.entries.filter(function(e){return e.id!==x.getAttribute("data-del");});saveLocal();renderEntries();renderRecent();toast("Entrée supprimée");}
  });
  document.addEventListener("change",function(ev){if(ev.target.matches("[data-dex]"))toggleCaught(ev.target.getAttribute("data-dex"));});
  q("#search").addEventListener("input",renderDex);
  if(q("#saveAnalysis"))q("#saveAnalysis").addEventListener("click",saveAnalysis);
  document.addEventListener("keydown",function(ev){if(ev.key==="Escape")closeDetail();});
  q("#form").addEventListener("submit",submitJournal);
  q("#cancel").addEventListener("click",resetForm);
  q("#export").addEventListener("click",exportJson);
  q("#import").addEventListener("change",importJson);
  q("#reset").addEventListener("click",function(){if(confirm("Tout effacer sur cet appareil ? La sauvegarde GitHub ne sera pas supprimée automatiquement.")){state=emptyState();state.updatedAt=Date.now();saveLocal();renderAll();resetForm();toast("Carnet local réinitialisé");}});
  if(q("#cloudRegister"))q("#cloudRegister").addEventListener("click",registerSupabase);
  if(q("#cloudLogin"))q("#cloudLogin").addEventListener("click",loginSupabase);
  if(q("#cloudSync"))q("#cloudSync").addEventListener("click",function(){syncSupabase(false,false);});
  if(q("#cloudLogout"))q("#cloudLogout").addEventListener("click",logoutSupabase);
  document.addEventListener("visibilitychange",function(){if(!document.hidden&&sbSession)syncSupabase(false,true);});
}
function init(){
  bind();renderOptions();resetForm();renderAll();
  if(sbSession){syncSupabase(false,true);startSupabasePolling();}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();