(function () {
  "use strict";

  const activityOptions = [
    { key: "bed", label: "臥床/極低活動", factor: 22 },
    { key: "sedentary", label: "久坐/輕度活動", factor: 25 },
    { key: "usual", label: "一般活動", factor: 30 },
    { key: "active", label: "中高活動", factor: 35 },
  ];

  const glucoseOptions = [
    { key: "good", label: "良好：A1C<7且低血糖少", carbRatio: 0.5 },
    { key: "fair", label: "尚可：A1C 7-8.5", carbRatio: 0.45 },
    { key: "poor", label: "不佳：A1C>8.5或餐後常高", carbRatio: 0.4 },
  ];

  const bodyAdjustments = {
    underweight: { label: "體重過輕", kcal: 200 },
    normal: { label: "正常", kcal: 0 },
    overweight: { label: "過重/肥胖", kcal: -250 },
  };

  const scenarios = [
    {
      name: "便當/桌菜",
      unit: "1份約4份主食",
      grains: 4,
      protein: 2,
      veg: 2,
      fat: 2,
      carbSource: "白飯",
      proteinSource: "主菜",
      fatRisk: "炸物、勾芡、滷汁",
      pairing: "白飯先定量，主菜選掌心大小，熟青菜至少半碗到一碗。",
      avoid: "炸排骨、滷汁淋滿、含糖飲",
      suitable: "午/晚餐",
      template: "白飯以1/4碗=1份估算；主菜用掌心/指寬估；蔬菜熟半碗=1份。",
    },
    {
      name: "水餃",
      unit: "1顆約0.5份主食",
      grains: 0.5,
      protein: 0.3,
      veg: 0.1,
      fat: 0.15,
      carbSource: "麵皮",
      proteinSource: "肉餡",
      fatRisk: "內餡油脂、沾醬",
      pairing: "搭配燙青菜與滷蛋或豆乾，避免只吃主食。",
      avoid: "甜辣醬、辣油、酸辣湯勾芡",
      suitable: "午/晚餐",
      template: "水餃每顆約半份澱粉，仍需搭配燙青菜與滷蛋/豆乾。",
    },
    {
      name: "煎餃",
      unit: "1顆約0.5份主食",
      grains: 0.5,
      protein: 0.3,
      veg: 0.1,
      fat: 0.35,
      carbSource: "麵皮",
      proteinSource: "肉餡",
      fatRisk: "煎油",
      pairing: "顆數比水餃更保守，改配無糖茶與青菜。",
      avoid: "辣油、甜辣醬、再加炸物",
      suitable: "早餐/午餐",
      template: "煎餃油脂較高；若吃煎餃，當餐少喝含糖飲、少加辣油。",
    },
    {
      name: "陽春麵",
      unit: "1碗約4份主食",
      grains: 4,
      protein: 1,
      veg: 0.5,
      fat: 1,
      carbSource: "麵條",
      proteinSource: "少量肉片/滷蛋",
      fatRisk: "湯頭油脂與鈉",
      pairing: "加燙青菜、豆乾或滷蛋，湯少喝。",
      avoid: "喝完整碗湯、油蔥加量",
      suitable: "午/晚餐",
      template: "陽春麵1碗約4份澱粉；建議加青菜與豆乾/滷蛋。",
    },
    {
      name: "白飯",
      unit: "1平碗約4份主食",
      grains: 4,
      protein: 0,
      veg: 0,
      fat: 0,
      carbSource: "白飯",
      proteinSource: "無",
      fatRisk: "搭配滷汁或勾芡時增加",
      pairing: "半碗到八分碗常是便當起始估算，再補蔬菜與蛋白質。",
      avoid: "飯量加大、滷汁淋滿",
      suitable: "三餐",
      template: "白飯1平碗約4份；半碗約2份。",
    },
    {
      name: "雞腿/排骨",
      unit: "掌心大小約3份蛋白",
      grains: 0,
      protein: 3,
      veg: 0,
      fat: 2,
      carbSource: "裹粉或醬汁",
      proteinSource: "雞腿/排骨",
      fatRisk: "炸皮、裹粉、醬汁",
      pairing: "去皮、避開炸衣，搭配青菜與定量飯。",
      avoid: "炸皮、糖醋或勾芡醬汁",
      suitable: "午/晚餐",
      template: "去皮雞腿掌心大小約3份蛋白；炸排骨需另算油脂。",
    },
    {
      name: "蔬菜",
      unit: "熟半碗約1份",
      grains: 0,
      protein: 0,
      veg: 1,
      fat: 0,
      carbSource: "少量",
      proteinSource: "無",
      fatRisk: "炒油、勾芡",
      pairing: "午晚餐至少熟青菜一碗，早餐可補生菜或燙青菜。",
      avoid: "炒油過多、羹湯勾芡",
      suitable: "三餐",
      template: "熟青菜半碗=1份，午晚餐至少2份較理想。",
    },
    {
      name: "滷肉飯/控肉飯",
      unit: "1碗約4份主食",
      grains: 4,
      protein: 1.5,
      veg: 0.2,
      fat: 2,
      carbSource: "白飯、滷汁",
      proteinSource: "肉燥/控肉",
      fatRisk: "肥肉、滷汁",
      pairing: "飯減量，選瘦肉，另加燙青菜與滷蛋或豆干。",
      avoid: "滷汁淋滿、肥肉、含糖飲",
      suitable: "午/晚餐",
      template: "飯量與滷汁油脂要控制；建議飯減量、瘦肉優先，另加燙青菜。",
    },
    {
      name: "牛肉麵",
      unit: "1碗約4份主食",
      grains: 4,
      protein: 2,
      veg: 0.5,
      fat: 1,
      carbSource: "麵條",
      proteinSource: "牛肉",
      fatRisk: "湯頭油脂與鈉",
      pairing: "麵量固定，湯少喝，多加燙青菜、海帶或豆乾。",
      avoid: "喝完整碗湯、加酸菜辣油",
      suitable: "午/晚餐",
      template: "麵量約1碗即4份主食；湯少喝，建議加燙青菜或海帶/豆乾。",
    },
    {
      name: "飯糰",
      unit: "1顆約4份主食",
      grains: 4,
      protein: 1,
      veg: 0,
      fat: 1.5,
      carbSource: "糯米",
      proteinSource: "蛋/肉鬆",
      fatRisk: "油條、肉鬆",
      pairing: "半顆或去油條，搭配無糖豆漿或茶葉蛋。",
      avoid: "油條、甜豆漿",
      suitable: "早餐",
      template: "飯糰糯米量常接近1碗飯；油條、肉鬆會增加油脂，建議半顆或去油條。",
    },
    {
      name: "鍋貼/水煎包",
      unit: "鍋貼1顆約0.7份主食",
      grains: 0.7,
      protein: 0.3,
      veg: 0.1,
      fat: 0.35,
      carbSource: "麵皮",
      proteinSource: "肉餡",
      fatRisk: "煎油",
      pairing: "搭配無糖豆漿或燙青菜，顆數比水餃更保守。",
      avoid: "辣油、甜辣醬",
      suitable: "早餐/午餐",
      template: "煎製點心同時含澱粉與油脂；顆數需控制，搭配無糖豆漿或燙青菜。",
    },
    {
      name: "大腸煎盤粿",
      unit: "1份約5份主食",
      servingName: "份",
      grains: 5,
      protein: 1,
      veg: 0,
      fat: 2,
      kcal: 750,
      carbSource: "蘿蔔糕/粉粿",
      proteinSource: "大腸",
      fatRisk: "大腸飽和脂肪、煎油、醬汁",
      pairing: "建議不再加醬汁，當正餐時補足燙青菜；腎臟病或糖尿病腎病變個案依每日主食份量調整。",
      avoid: "醬汁加滿、頻繁吃大腸、再搭配含糖飲",
      suitable: "早餐/點心/夜市",
      template: "1份約全穀根莖類5份、豆魚肉蛋類1份、油脂類2份；熱量約750 kcal。",
    },
    {
      name: "蚵仔大腸麵線",
      unit: "1碗約3份主食",
      servingName: "碗",
      grains: 3,
      protein: 1,
      veg: 1,
      fat: 0.5,
      kcal: 329,
      carbSource: "麵線/勾芡",
      proteinSource: "蚵仔、大腸",
      fatRisk: "湯汁鈉、勾芡、大腸",
      pairing: "滷小腸建議吃一半，另加半碗低鈉蔬菜；若當正餐可再依計畫補水果。",
      avoid: "湯汁喝完、辣油加量、痛風或腎功能異常時過量",
      suitable: "午/晚餐/點心",
      template: "1碗約全穀根莖類3份、豆魚肉蛋類1份、蔬菜類1份；熱量約329 kcal。",
    },
    {
      name: "蛋餅",
      unit: "1份約2份主食",
      servingName: "份",
      grains: 2,
      protein: 1,
      veg: 0.1,
      fat: 4,
      kcal: 404,
      carbSource: "蛋餅皮",
      proteinSource: "雞蛋",
      fatRisk: "煎油",
      pairing: "早餐若吃蛋餅，可配無糖豆漿或少量米漿補足需求；午晚餐改清淡少油、高纖。",
      avoid: "甜辣醬加滿、再搭油炸點心或含糖飲",
      suitable: "早餐",
      template: "1份約全穀根莖類2份、豆魚肉蛋類1份、蔬菜類0.1份、油脂類4份；熱量約404 kcal。",
    },
    {
      name: "潤餅",
      unit: "1捲約1.5份主食",
      servingName: "捲",
      grains: 1.5,
      protein: 1,
      veg: 2,
      fat: 2,
      kcal: 379,
      carbSource: "潤餅皮、糖粉、配料",
      proteinSource: "肉、蛋皮",
      fatRisk: "花生粉、煎蛋皮、油麵",
      pairing: "加1份水果可作正餐；糖尿病腎病變個案可用冬粉、河粉、粉條、米粉等低氮澱粉替代油麵。",
      avoid: "糖粉過量、油麵加量、肉與煎蛋皮過量",
      suitable: "午/晚餐/節慶",
      template: "1捲約全穀根莖類1.5份、豆魚肉蛋類1份、蔬菜類2份、油脂類2份；熱量約379 kcal。",
    },
    {
      name: "假魚肚羹",
      unit: "1碗約1份主食",
      servingName: "碗",
      grains: 1,
      protein: 3,
      veg: 0.1,
      fat: 3,
      kcal: 425,
      carbSource: "羹湯勾芡",
      proteinSource: "炸豬皮、魚漿",
      fatRisk: "炸豬皮、加工魚漿、羹湯鈉",
      pairing: "若選用，主食需另行控制並補蔬菜；腎臟病患者建議少吃。",
      avoid: "湯汁喝完、再搭炸物或加工品",
      suitable: "午/晚餐/小吃",
      template: "1碗約全穀根莖類1份、豆魚肉蛋類3份、蔬菜類0.1份；依三大營養素換算約425 kcal。",
    },
    {
      name: "土豆油飯",
      unit: "1盒約3.3份主食",
      servingName: "盒",
      grains: 3.3,
      protein: 0.3,
      veg: 0,
      fat: 3,
      kcal: 439,
      sourceNote: "PDF熱量列493.5 kcal，但依蛋白質10.3g、脂肪20.5g、醣類53.2g換算約439 kcal。",
      carbSource: "糯米飯",
      proteinSource: "花生、少量肉燥",
      fatRisk: "油飯用油、花生、肉燥",
      pairing: "淺嚐即可；若當正餐需加燙青菜與適量蛋白質。",
      avoid: "過量、再加滷汁或含糖飲",
      suitable: "午/晚餐/節慶",
      template: "1盒約全穀根莖類3.3份、豆魚肉蛋類0.3份、油脂類3份；校正熱量約439 kcal。",
    },
    {
      name: "花生米腸",
      unit: "1份約2.5份主食",
      servingName: "份",
      grains: 2.5,
      protein: 0.1,
      veg: 0,
      fat: 1.7,
      kcal: 275,
      carbSource: "糯米飯",
      proteinSource: "花生",
      fatRisk: "花生、豬油煎製",
      pairing: "適合當點心；若當正餐建議加1碗蔬菜豆腐湯，飯後水果依餐次計畫安排。",
      avoid: "高血脂者常吃、再配甜醬或含糖飲",
      suitable: "點心/夜市",
      template: "1份約全穀根莖類2.5份、豆魚肉蛋類0.1份、油脂類1.7份；熱量約275 kcal。",
    },
    {
      name: "皮蛋瘦肉粥",
      unit: "1碗約4份主食",
      servingName: "碗",
      grains: 4,
      protein: 2,
      veg: 0.3,
      fat: 0.5,
      kcal: 449,
      carbSource: "稀飯",
      proteinSource: "皮蛋、瘦肉、吻仔魚、油條",
      fatRisk: "油條、皮蛋鈉、粥品糊化快",
      pairing: "可再配半碗炒青菜使營養更均衡；糖尿病患者粥量宜少，避免過度糊化造成血糖上升快。",
      avoid: "油條加量、粥吃過量、湯汁鈉過多",
      suitable: "早餐/午餐",
      template: "1碗約全穀根莖類4份、豆魚肉蛋類2份、蔬菜類0.3份、油脂類少許；熱量約449 kcal。",
    },
    {
      name: "當歸鴨冬粉",
      unit: "1碗約2.5份主食",
      servingName: "碗",
      grains: 2.5,
      protein: 2,
      veg: 1,
      fat: 0.5,
      kcal: 278,
      carbSource: "冬粉",
      proteinSource: "鴨肉",
      fatRisk: "湯汁鈉、鴨皮油脂",
      pairing: "冬粉當主食可降低蛋白質攝取；腎臟病患者建議不喝湯，鴨肉酌量。",
      avoid: "湯喝完、鴨肉過量、加重口味沾醬",
      suitable: "午/晚餐",
      template: "1碗約全穀根莖類2.5份、豆魚肉蛋類2份、蔬菜類1份；熱量約278 kcal。",
    },
    {
      name: "蚵仔煎",
      unit: "1盤約2份主食",
      servingName: "盤",
      grains: 2,
      protein: 1.3,
      veg: 0.7,
      fat: 6,
      kcal: 517,
      carbSource: "蕃薯粉、甜醬",
      proteinSource: "蚵仔、雞蛋",
      fatRisk: "煎油、甜醬",
      pairing: "腎臟病患者可請老闆不加蛋、只用蚵仔；糖尿病腎病變個案建議醬料減半。",
      avoid: "甜醬全加、再配甜飲、油脂高的其他小吃",
      suitable: "午/晚餐/夜市",
      template: "1盤約全穀根莖類2份、豆魚肉蛋類1.3份、蔬菜類0.7份、油脂類6份；熱量約517 kcal。",
    },
  ];

  // 台灣食物代換表每份營養素（國健署）；豆魚蛋肉以中脂計
  const EX = {
    grain: { carb: 15, protein: 2, kcal: 70 },
    meat: { protein: 7, kcal: 75 },
    veg: { carb: 5, protein: 1, kcal: 25 },
    fat: { kcal: 45 },
  };

  const meals = [
    { key: "breakfast", label: "早餐", protein: 2, veg: 0.5 },
    { key: "lunch", label: "午餐", protein: 3, veg: 2 },
    { key: "dinner", label: "晚餐", protein: 3, veg: 2 },
  ];

  const ids = [
    "patientId",
    "sex",
    "age",
    "height",
    "weight",
    "activity",
    "bodyAdjust",
    "a1c",
    "egfr",
    "glucose",
    "renalTreatment",
    "autoRatios",
    "breakfastRatio",
    "lunchRatio",
    "dinnerRatio",
    "mealSelect",
    "scenarioSelect",
  ];

  const el = {};
  let currentMealRows = [];
  let applyingRatios = false;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    ids.forEach((id) => {
      el[id] = document.getElementById(id);
    });

    fillSelect(el.activity, activityOptions, "key", "label", "sedentary");
    fillSelect(el.glucose, glucoseOptions, "key", "label", "fair");
    fillSelect(el.mealSelect, meals, "key", "label", "lunch");
    fillSelect(el.scenarioSelect, scenarios, "name", "name", "水餃");

    ["breakfastRatio", "lunchRatio", "dinnerRatio"].forEach((id) => {
      el[id].addEventListener("input", () => {
        if (!applyingRatios) {
          el.autoRatios.checked = false;
        }
        calculateAndRender();
      });
    });

    document.getElementById("patientForm").addEventListener("input", (event) => {
      if (event.target.id === "a1c") {
        syncGlucoseFromA1c();
      }
      calculateAndRender();
    });

    document.getElementById("patientForm").addEventListener("change", (event) => {
      // 數字欄位已在 input 事件重算；select/checkbox 才需要在 change 時重算
      if (event.target.type !== "number" && event.target.type !== "text") calculateAndRender();
    });
    el.mealSelect.addEventListener("change", calculateAndRender);
    el.scenarioSelect.addEventListener("change", calculateAndRender);

    document.getElementById("printBtn").addEventListener("click", () => window.print());
    document.getElementById("copyBtn").addEventListener("click", copySummary);
    document.getElementById("resetBtn").addEventListener("click", resetForm);

    applyRatios([25, 37.5, 37.5]);
    renderFoodGrid();
    calculateAndRender();
  }

  function fillSelect(select, items, valueKey, labelKey, selectedValue) {
    select.innerHTML = "";
    items.forEach((item) => {
      const option = document.createElement("option");
      option.value = item[valueKey];
      option.textContent = item[labelKey];
      if (item[valueKey] === selectedValue) option.selected = true;
      select.append(option);
    });
  }

  function resetForm() {
    el.patientId.value = "王小明";
    el.sex.value = "male";
    el.age.value = "65";
    el.height.value = "165";
    el.weight.value = "72";
    el.activity.value = "sedentary";
    el.bodyAdjust.value = "auto";
    el.a1c.value = "8.2";
    el.egfr.value = "55";
    el.glucose.value = "fair";
    el.renalTreatment.value = "none";
    el.autoRatios.checked = true;
    el.mealSelect.value = "lunch";
    el.scenarioSelect.value = "水餃";
    calculateAndRender();
    toast("已重設為範例個案");
  }

  function syncGlucoseFromA1c() {
    const a1c = readNumber(el.a1c);
    if (!(a1c >= ranges.a1c[0] && a1c <= ranges.a1c[1])) return;
    if (a1c < 7) el.glucose.value = "good";
    if (a1c >= 7 && a1c <= 8.5) el.glucose.value = "fair";
    if (a1c > 8.5) el.glucose.value = "poor";
  }

  function calculateAndRender() {
    const state = readState();
    const suggestion = suggestRatios(state);
    if (state.autoRatios) {
      applyRatios(suggestion.ratios);
      state.ratios = readRatios();
    }

    const results = calculate(state);
    currentMealRows = results.meals;
    renderMetrics(results, suggestion);
    renderMeals(results);
    renderScenario();
    renderSummary(results, suggestion);
    updateInputStatus(results);
  }

  // 超出合理範圍視為未輸入，避免打字中途（如身高只打到 16）算出離譜結果
  const ranges = {
    age: [18, 120],
    height: [120, 220],
    weight: [25, 250],
    a1c: [3, 20],
    egfr: [0, 200],
  };

  function readChecked(id) {
    const input = el[id];
    const value = readNumber(input);
    const [min, max] = ranges[id];
    const bad = input.value.trim() !== "" && !(value >= min && value <= max);
    input.setAttribute("aria-invalid", bad ? "true" : "false");
    return bad ? NaN : value;
  }

  function invalidFields() {
    return Object.keys(ranges).filter((id) => el[id].getAttribute("aria-invalid") === "true");
  }

  function readState() {
    return {
      patientId: el.patientId.value.trim(),
      sex: el.sex.value,
      age: readChecked("age"),
      height: readChecked("height"),
      weight: readChecked("weight"),
      activityKey: el.activity.value,
      bodyAdjust: el.bodyAdjust.value,
      a1c: readChecked("a1c"),
      egfr: readChecked("egfr"),
      glucoseKey: el.glucose.value,
      renalTreatment: el.renalTreatment.value,
      autoRatios: el.autoRatios.checked,
      ratios: readRatios(),
    };
  }

  function readRatios() {
    return [
      readNumber(el.breakfastRatio) || 0,
      readNumber(el.lunchRatio) || 0,
      readNumber(el.dinnerRatio) || 0,
    ];
  }

  function readNumber(input) {
    const value = Number.parseFloat(input.value);
    return Number.isFinite(value) ? value : NaN;
  }

  function applyRatios(ratios) {
    applyingRatios = true;
    el.breakfastRatio.value = formatRatio(ratios[0]);
    el.lunchRatio.value = formatRatio(ratios[1]);
    el.dinnerRatio.value = formatRatio(ratios[2]);
    applyingRatios = false;
  }

  function suggestRatios(state) {
    const activity = activityOptions.find((item) => item.key === state.activityKey);
    const glucose = glucoseOptions.find((item) => item.key === state.glucoseKey);
    const renal = renalStage(state.egfr, state.renalTreatment);
    let ratios = [25, 37.5, 37.5];
    const reasons = ["標準三餐以早餐25%、午餐37.5%、晚餐37.5%作為起始值"];

    if (activity?.key === "active") {
      ratios = [30, 40, 30];
      reasons.push("中高活動者將較多熱量安排在白天活動時段");
    }

    if (activity?.key === "bed") {
      ratios = [30, 35, 35];
      reasons.push("極低活動者採較平均分配，避免單餐過量");
    }

    if (glucose?.key === "poor") {
      ratios = activity?.key === "active" ? [30, 37.5, 32.5] : [30, 35, 35];
      reasons.push("血糖控制不佳時先降低晚餐負荷，醣量比例同步熱量比例");
    }

    if (renal.level >= 3 || state.renalTreatment !== "none") {
      reasons.push("腎功能異常時熱量不單純下修，蛋白質與鈉鉀磷需由營養師另行覆核");
    }

    return { ratios, reason: reasons.join("；") + "。" };
  }

  function calculate(state) {
    const activity = activityOptions.find((item) => item.key === state.activityKey) || activityOptions[1];
    const glucose = glucoseOptions.find((item) => item.key === state.glucoseKey) || glucoseOptions[1];
    const ibw = calculateIbw(state.sex, state.height);
    const bmi = state.weight / Math.pow(state.height / 100, 2);
    const autoBodyKey = bodyKeyFromBmi(bmi);
    const bodyKey = state.bodyAdjust === "auto" ? autoBodyKey : state.bodyAdjust;
    const adjustment = bodyAdjustments[bodyKey] || bodyAdjustments.normal;
    const totalKcal = roundToNearest(ibw * activity.factor + adjustment.kcal, 50);
    const dailyCarb = Math.round((totalKcal * glucose.carbRatio) / 4);
    const renal = renalStage(state.egfr, state.renalTreatment);
    const proteinPlan = proteinTarget(totalKcal, ibw, renal);
    const dailyProtein = proteinPlan.grams;
    const dailyFat = Math.max(0, Math.round((totalKcal - dailyCarb * 4 - dailyProtein * 4) / 9));
    const proteinWeightSum = meals.reduce((sum, meal) => sum + meal.protein, 0);
    const mealRows = meals.map((meal, index) => {
      const ratio = state.ratios[index] || 0;
      const kcal = Math.round((totalKcal * ratio) / 100);
      const carbs = Math.round((dailyCarb * ratio) / 100);
      const veg = meal.veg;
      // 醣量先扣蔬菜（每份 5 g），其餘由全穀雜糧（每份 15 g）提供
      const grains = Math.max(0, roundHalf((carbs - veg * EX.veg.carb) / EX.grain.carb));
      // 蛋白質依每日目標按餐次權重分配，扣除主食與蔬菜所含蛋白後換成豆魚蛋肉份數
      const mealProteinG = (dailyProtein * meal.protein) / proteinWeightSum;
      const protein = Math.max(
        0,
        roundHalf((mealProteinG - grains * EX.grain.protein - veg * EX.veg.protein) / EX.meat.protein),
      );
      const fat = Math.max(
        0,
        roundHalf((kcal - grains * EX.grain.kcal - protein * EX.meat.kcal - veg * EX.veg.kcal) / EX.fat.kcal),
      );
      const exchangeKcal = grains * EX.grain.kcal + protein * EX.meat.kcal + veg * EX.veg.kcal + fat * EX.fat.kcal;
      return {
        ...meal,
        ratio,
        kcal,
        carbs,
        grains,
        protein,
        veg,
        fat,
        exchangeKcal,
        note: mealNote(meal.key, grains, renal),
      };
    });

    return {
      ...state,
      activity,
      glucose,
      ibw,
      bmi,
      autoBodyKey,
      bodyKey,
      adjustment,
      totalKcal,
      dailyCarb,
      dailyProtein,
      dailyFat,
      proteinPlan,
      renal,
      meals: mealRows,
      ratioSum: state.ratios.reduce((sum, value) => sum + value, 0),
    };
  }

  function proteinTarget(totalKcal, ibw, renal) {
    if (renal.dialysis && Number.isFinite(ibw)) {
      return {
        grams: Math.round(ibw * 1.1),
        note: "透析 1.0–1.2 g/kg IBW（取 1.1）",
      };
    }
    if (renal.level >= 3 && Number.isFinite(ibw)) {
      return {
        grams: Math.round(ibw * 0.8),
        note: "CKD G3–G5 未透析 0.8 g/kg IBW",
      };
    }
    return {
      grams: Math.round((totalKcal * 0.2) / 4),
      note: "總熱量 20%",
    };
  }

  function calculateIbw(sex, height) {
    if (!Number.isFinite(height)) return NaN;
    if (sex === "male") return roundOne((height - 80) * 0.7);
    return roundOne((height - 70) * 0.6);
  }

  function bodyKeyFromBmi(bmi) {
    if (!Number.isFinite(bmi)) return "normal";
    if (bmi < 18.5) return "underweight";
    if (bmi < 24) return "normal";
    return "overweight";
  }

  function renalStage(egfr, treatment) {
    if (treatment === "dialysis") {
      return {
        label: "透析中",
        level: 5,
        note: "透析、鉀磷與蛋白質需專科營養處方",
        caution: true,
        dialysis: true,
      };
    }
    if (!Number.isFinite(egfr)) {
      return { label: "未輸入", level: 0, note: "請補 eGFR 或腎功能註記", caution: true };
    }
    if (egfr >= 90) return { label: "G1", level: 1, note: "仍需搭配尿蛋白與病史判讀", caution: false };
    if (egfr >= 60) return { label: "G2", level: 2, note: "避免過量蛋白與高鈉外食", caution: false };
    if (egfr >= 45) return { label: "G3a", level: 3, note: "CKD 風險，蛋白質份量需覆核", caution: true };
    if (egfr >= 30) return { label: "G3b", level: 4, note: "需個別化蛋白質、鈉鉀磷與熱量", caution: true };
    if (egfr >= 15) return { label: "G4", level: 5, note: "腎臟病營養處方優先", caution: true };
    return { label: "G5", level: 5, note: "腎臟專科與營養師共同評估", caution: true };
  }

  function mealNote(key, grains, renal) {
    if (!Number.isFinite(grains)) return "請先完成身高、體重等個案資料。";
    const riceBowl = formatNumber(grains / 4, 1);
    if (key === "breakfast") {
      return `主食約 ${formatNumber(grains, 1)} 份；蛋餅、飯糰、饅頭擇一，含糖飲避免疊加。`;
    }
    if (key === "lunch") {
      const renalText = renal.caution ? "，腎功能異常時湯汁與加工品需再確認" : "";
      return `便當白飯約 ${riceBowl} 碗，熟青菜至少一碗，炸物與滷汁另算油脂${renalText}。`;
    }
    const dumplings = Math.round(grains / 0.5);
    return `晚餐主食約 ${formatNumber(grains, 1)} 份；若換水餃約 ${dumplings} 顆，避免再加甜湯或含糖飲。`;
  }

  function renderMetrics(results, suggestion) {
    setText("dailyKcal", formatNumber(results.totalKcal, 0));
    setText("dailyCarb", `${formatNumber(results.dailyCarb, 0)} g`);
    setText("carbRatioText", `醣類 ${formatNumber(results.glucose.carbRatio * 100, 0)}%`);
    setText("bmiText", Number.isFinite(results.bmi) ? formatNumber(results.bmi, 1) : "--");
    setText(
      "bodyText",
      Number.isFinite(results.bmi) || results.bodyAdjust !== "auto"
        ? `${bodyAdjustments[results.bodyKey].label}，${formatSigned(results.adjustment.kcal)} kcal`
        : "--",
    );
    setText("ibwText", Number.isFinite(results.ibw) ? `${formatNumber(results.ibw, 1)} kg` : "--");
    setText("proteinText", `${formatNumber(results.dailyProtein, 0)} g`);
    setText(
      "proteinNote",
      results.renal.caution
        ? `${results.proteinPlan.note}；需個別化`
        : `${results.proteinPlan.note}；脂肪約 ${formatNumber(results.dailyFat, 0)} g/day`,
    );
    setText("renalStage", results.renal.label);
    setText("renalNote", results.renal.note);
    document.getElementById("ratioReason").textContent = suggestion.reason;

    const ratioCheck = document.getElementById("ratioCheck");
    ratioCheck.className = "check-pill";
    if (Math.abs(results.ratioSum - 100) <= 0.1) {
      ratioCheck.textContent = "合計 100.0%";
    } else {
      ratioCheck.textContent = `合計 ${formatNumber(results.ratioSum, 1)}%`;
      ratioCheck.classList.add(Math.abs(results.ratioSum - 100) > 5 ? "danger" : "warn");
    }
  }

  function renderMeals(results) {
    const tbody = document.getElementById("mealRows");
    tbody.innerHTML = results.meals
      .map(
        (meal) => `
          <tr>
            <td><span class="meal-name">${escapeHtml(meal.label)}</span><br><small>${formatNumber(meal.ratio, 1)}%</small></td>
            <td>${formatNumber(meal.kcal, 0)} kcal${exchangeCheck(meal)}</td>
            <td>${formatNumber(meal.carbs, 0)} g</td>
            <td>${formatNumber(meal.grains, 1)} 份</td>
            <td>${formatNumber(meal.protein, 1)} 份</td>
            <td>${formatNumber(meal.veg, 1)} 份</td>
            <td>${formatNumber(meal.fat, 1)} 份</td>
            <td>${escapeHtml(meal.note)}</td>
          </tr>
        `,
      )
      .join("");
  }

  function exchangeCheck(meal) {
    if (!Number.isFinite(meal.kcal) || meal.kcal <= 0) return "";
    const over = meal.exchangeKcal - meal.kcal;
    const cls = over > meal.kcal * 0.1 ? ' class="over"' : "";
    const text = over > meal.kcal * 0.1 ? "份數合計偏高，主食或蛋白需下修" : "份數合計";
    return `<br><small${cls}>${text} ${formatNumber(meal.exchangeKcal, 0)} kcal</small>`;
  }

  function renderScenario() {
    const meal = currentMealRows.find((item) => item.key === el.mealSelect.value) || currentMealRows[1];
    const scenario = scenarios.find((item) => item.name === el.scenarioSelect.value) || scenarios[1];
    if (!meal || !scenario) return;

    const quantity = quantityForScenario(scenario, meal);
    const renalWarn =
      [
        "滷肉飯/控肉飯",
        "牛肉麵",
        "陽春麵",
        "雞腿/排骨",
        "大腸煎盤粿",
        "蚵仔大腸麵線",
        "假魚肚羹",
        "皮蛋瘦肉粥",
        "當歸鴨冬粉",
        "蚵仔煎",
      ].includes(scenario.name) && renalStage(readNumber(el.egfr), el.renalTreatment.value).caution;
    const result = document.getElementById("scenarioResult");
    result.innerHTML = `
      <div>
        <h3>${escapeHtml(meal.label)}換成${escapeHtml(scenario.name)}</h3>
        <div class="result-quantity">${escapeHtml(quantity)}</div>
        <div class="tag-list">
          <span class="tag">主食 ${formatNumber(meal.grains, 1)} 份</span>
          <span class="tag">蛋白 ${formatNumber(meal.protein, 1)} 份</span>
          <span class="tag">蔬菜 ${formatNumber(meal.veg, 1)} 份</span>
          ${scenario.kcal ? `<span class="tag">每${escapeHtml(scenario.servingName || "份")}約 ${formatNumber(scenario.kcal, 0)} kcal</span>` : ""}
          ${kcalMismatch(scenario) ? `<span class="tag warn">依份數換算約 ${formatNumber(scenarioExchangeKcal(scenario), 0)} kcal，與標示差異較大</span>` : ""}
          <span class="tag ${scenario.fat >= 1.5 ? "warn" : ""}">油脂風險：${escapeHtml(scenario.fatRisk)}</span>
          ${scenario.sourceNote ? `<span class="tag warn">${escapeHtml(scenario.sourceNote)}</span>` : ""}
          ${renalWarn ? '<span class="tag warn">腎功能：注意鈉/湯汁/加工品</span>' : ""}
        </div>
      </div>
      <div>
        <p><strong>搭配</strong><br>${escapeHtml(scenario.pairing)}</p>
        <p><strong>少吃/避免</strong><br>${escapeHtml(scenario.avoid)}</p>
        <p><strong>給個案的說法</strong><br>${escapeHtml(patientPhrase(meal, scenario, quantity))}</p>
      </div>
    `;
  }

  function scenarioExchangeKcal(item) {
    return item.grains * EX.grain.kcal + item.protein * EX.meat.kcal + item.veg * EX.veg.kcal + item.fat * EX.fat.kcal;
  }

  function kcalMismatch(item) {
    if (!item.kcal || item.sourceNote) return false;
    return Math.abs(scenarioExchangeKcal(item) - item.kcal) / item.kcal > 0.15;
  }

  function renderFoodGrid() {
    const grid = document.getElementById("foodGrid");
    grid.innerHTML = scenarios
      .map(
        (item) => `
          <article class="food-card">
            <h3>${escapeHtml(item.name)}</h3>
            <p class="food-meta">${escapeHtml(item.unit)} · ${escapeHtml(item.suitable)}${item.kcal ? ` · 約${formatNumber(item.kcal, 0)} kcal` : ""}</p>
            <p>${escapeHtml(item.template)}</p>
            ${item.sourceNote ? `<p>${escapeHtml(item.sourceNote)}</p>` : ""}
            ${kcalMismatch(item) ? `<p class="food-flag">依份數換算約 ${formatNumber(scenarioExchangeKcal(item), 0)} kcal，與標示 ${formatNumber(item.kcal, 0)} kcal 差異 >15%，請核對來源。</p>` : ""}
            <p>主要醣量來源：${escapeHtml(item.carbSource)}</p>
          </article>
        `,
      )
      .join("");
  }

  function quantityForScenario(scenario, meal) {
    const g = meal.grains;
    const p = meal.protein;
    const v = meal.veg;
    const f = meal.fat;
    if (!Number.isFinite(g)) return "請先完成個案資料";
    if (scenario.servingName) {
      // 份量同時受主食與蛋白質份數限制，取較小者，避免高蛋白小吃換出過多份
      const byGrain = scenario.grains > 0 ? g / scenario.grains : Infinity;
      const byProtein = scenario.protein >= 1 ? p / scenario.protein : Infinity;
      // 也不超過本餐熱量；以 1/4 份無條件捨去，偏保守
      const byKcal = meal.kcal / scenarioExchangeKcal(scenario);
      const base = Math.min(byGrain, byProtein, byKcal);
      if (!Number.isFinite(base)) return "請先完成個案資料";
      const portion = Math.max(0.25, Math.floor(base * 4 + 1e-9) / 4);
      const grainGap = roundHalf(g - portion * scenario.grains);
      const kcalBound = byKcal <= Math.min(byGrain, byProtein);
      const addGrain = grainGap >= 1 && !kcalBound ?`，主食不足可補白飯約 ${formatNumber(grainGap / 4, 1)} 碗` : "";
      const addVeg = scenario.veg * portion < v ? "，並補足青菜" : "";
      const sauce = scenario.fat * portion > f + 1 ? "；油脂超過本餐份數，醬料/湯汁減量" : "";
      return `約 ${formatNumber(portion, 2)} ${scenario.servingName}${addGrain}${addVeg}${sauce}`;
    }
    switch (scenario.name) {
      case "便當/桌菜":
        return `白飯約 ${formatNumber(g / 4, 1)} 碗；主菜約 ${formatNumber(p / 3, 1)} 掌心；熟菜約 ${formatNumber(v / 2, 1)} 碗`;
      case "水餃":
        return `約 ${Math.max(1, Math.round(g / 0.5))} 顆水餃`;
      case "煎餃": {
        const count = Math.floor(Math.min(g / 0.5, f > 0 ? f / 0.35 : 0));
        return count > 0 ? `約 ${count} 顆煎餃` : "油脂份數不足，需調整餐次或改水餃";
      }
      case "陽春麵":
        return `約 ${formatNumber(g / 4, 1)} 碗陽春麵`;
      case "白飯":
        return `約 ${formatNumber(g / 4, 1)} 碗白飯`;
      case "雞腿/排骨":
        return `約 ${formatNumber(p / 3, 1)} 份掌心大小主菜`;
      case "蔬菜":
        return `熟青菜約 ${formatNumber(v / 2, 1)} 碗`;
      case "滷肉飯/控肉飯":
        return `飯量約 ${formatNumber(g / 4, 1)} 碗；滷汁少淋並補青菜`;
      case "牛肉麵":
        return `約 ${formatNumber(g / 4, 1)} 碗；湯少喝並加青菜`;
      case "飯糰":
        return `約 ${formatNumber(g / 4, 1)} 顆；可改半顆或去油條`;
      case "鍋貼/水煎包": {
        const count = Math.floor(Math.min(g / 0.7, f > 0 ? f / 0.35 : g / 0.7));
        return count > 0 ? `鍋貼約 ${count} 顆，水煎包約半份到1份` : "油脂份數不足，建議改蒸煮主食";
      }
      default:
        return "請選擇情境";
    }
  }

  function patientPhrase(meal, scenario, quantity) {
    return `這餐先抓 ${formatNumber(meal.grains, 1)} 份主食；換成${scenario.name}大約是：${quantity}。${scenario.pairing}`;
  }

  function renderSummary(results, suggestion) {
    const selectedMeal = currentMealRows.find((item) => item.key === el.mealSelect.value) || currentMealRows[1];
    const selectedScenario = scenarios.find((item) => item.name === el.scenarioSelect.value) || scenarios[1];
    const quantity = quantityForScenario(selectedScenario, selectedMeal);
    const lines = [
      `個案：${results.patientId || "未填"}，${results.sex === "male" ? "男" : "女"}，${formatNumber(results.age, 0)}歲`,
      `身高/體重：${formatNumber(results.height, 1)} cm / ${formatNumber(results.weight, 1)} kg，BMI ${formatNumber(results.bmi, 1)}（${bodyAdjustments[results.bodyKey].label}）`,
      `估算：每日 ${formatNumber(results.totalKcal, 0)} kcal，醣量 ${formatNumber(results.dailyCarb, 0)} g/day（${formatNumber(results.glucose.carbRatio * 100, 0)}%），蛋白質約 ${formatNumber(results.dailyProtein, 0)} g/day（${results.proteinPlan.note}）`,
      `腎功能：${results.renal.label}，${results.renal.note}`,
      `三餐配比：早餐 ${formatNumber(results.meals[0].ratio, 1)}%、午餐 ${formatNumber(results.meals[1].ratio, 1)}%、晚餐 ${formatNumber(results.meals[2].ratio, 1)}%。${suggestion.reason}`,
      "",
      "每餐主食份量：",
      ...results.meals.map(
        (meal) =>
          `- ${meal.label}：${formatNumber(meal.kcal, 0)} kcal，醣量 ${formatNumber(meal.carbs, 0)} g；全穀雜糧 ${formatNumber(meal.grains, 1)} 份、豆魚蛋肉 ${formatNumber(meal.protein, 1)} 份、蔬菜 ${formatNumber(meal.veg, 1)} 份、油脂 ${formatNumber(meal.fat, 1)} 份。${meal.note}`,
      ),
      "若當餐安排水果 1 份（醣 15 g），主食同步減 1 份。",
      "",
      `外食代換示範：${selectedMeal.label}選${selectedScenario.name}，${quantity}`,
      `提醒：${selectedScenario.avoid}。${results.renal.caution ? "腎功能異常者需再確認蛋白質、鈉、鉀、磷與湯汁攝取。" : "實際處方仍需依用藥、血糖紀錄與營養評估調整。"}`,
    ];
    document.getElementById("summaryText").textContent = lines.join("\n");
  }

  function updateInputStatus(results) {
    const status = document.getElementById("inputStatus");
    const labels = { age: "年齡", height: "身高", weight: "體重", a1c: "A1C", egfr: "eGFR" };
    const bad = invalidFields();
    const missing = !Number.isFinite(results.height) || !Number.isFinite(results.weight);
    status.classList.toggle("warn", bad.length > 0 || missing);
    if (bad.length) {
      status.textContent = `請檢查：${bad.map((id) => labels[id]).join("、")}`;
    } else if (missing) {
      status.textContent = "請輸入身高體重";
    } else {
      status.textContent = results.patientId ? "已輸入" : "未命名";
    }
  }

  async function copySummary() {
    const text = document.getElementById("summaryText").textContent;
    try {
      await navigator.clipboard.writeText(text);
      toast("衛教摘要已複製");
    } catch (error) {
      // file:// 或舊瀏覽器沒有 Clipboard API 時改用選取複製
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.append(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      toast(ok ? "衛教摘要已複製" : "複製失敗，可改用列印");
    }
  }

  function toast(message) {
    const oldToast = document.querySelector(".toast");
    if (oldToast) oldToast.remove();
    const node = document.createElement("div");
    node.className = "toast";
    node.textContent = message;
    document.body.append(node);
    window.setTimeout(() => node.remove(), 2400);
  }

  function setText(id, value) {
    document.getElementById(id).textContent = value;
  }

  function roundToNearest(value, step) {
    if (!Number.isFinite(value)) return NaN;
    return Math.round(value / step) * step;
  }

  function roundHalf(value) {
    if (!Number.isFinite(value)) return NaN;
    return Math.round(value * 2) / 2;
  }

  function roundOne(value) {
    if (!Number.isFinite(value)) return NaN;
    return Math.round(value * 10) / 10;
  }

  function formatNumber(value, digits) {
    if (!Number.isFinite(value)) return "--";
    return value.toLocaleString("zh-TW", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }

  function formatRatio(value) {
    return Number.isInteger(value) ? String(value) : String(value.toFixed(1));
  }

  function formatSigned(value) {
    if (value > 0) return `+${value}`;
    return String(value);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
