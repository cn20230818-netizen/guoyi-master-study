import { initialAnswers, moduleMeta } from '../data/catalog';

const formulaVariationRules = {
  stroke: {
    phase: {
      acute: { label: '急性发作', herbs: [['竹茹', '12g'], ['僵蚕', '10g']] },
      recovery: { label: '恢复期', herbs: [['黄芪', '30g'], ['鸡血藤', '20g']] },
      sequelae: { label: '后遗期', herbs: [['桑枝', '20g'], ['伸筋草', '15g']] },
    },
    signs: {
      '半身不遂': { label: '半身不遂', herbs: [['地龙', '10g'], ['鸡血藤', '20g']] },
      '口舌謇涩 / 失语': { label: '言语不利', herbs: [['远志', '10g'], ['僵蚕', '10g']] },
      '神志不清': { label: '神识不清', herbs: [['石菖蒲', '12g'], ['远志', '10g']] },
      '头痛呕吐': { label: '头痛呕吐', herbs: [['天麻', '10g'], ['竹茹', '12g']] },
      '眩晕面赤': { label: '眩晕面赤', herbs: [['钩藤', '15g'], ['夏枯草', '12g']] },
      '痰多胸闷': { label: '痰多胸闷', herbs: [['瓜蒌皮', '15g'], ['陈皮', '10g']] },
      '舌暗有瘀': { label: '舌暗有瘀', herbs: [['丹参', '20g'], ['桃仁', '10g']] },
      '肢体麻木': { label: '肢体麻木', herbs: [['络石藤', '15g'], ['威灵仙', '10g']] },
    },
    constitutions: {
      '气虚阳虚': { label: '气虚阳虚', herbs: [['黄芪', '30g'], ['桂枝', '10g']] },
      '肾精不足': { label: '肾精不足', herbs: [['熟地黄', '15g'], ['山茱萸', '12g']] },
      '阴虚火旺': { label: '阴虚火旺', herbs: [['生地黄', '15g'], ['麦冬', '12g']] },
      '痰湿偏盛': { label: '痰湿偏盛', herbs: [['茯苓', '20g'], ['法半夏', '12g']] },
      '瘀血明显': { label: '瘀血明显', herbs: [['丹参', '20g'], ['鸡血藤', '20g']] },
    },
  },
  epilepsy: {
    phase: {
      acute: { label: '发作期', herbs: [['钩藤', '15g'], ['珍珠母', '30g 先煎']] },
      interictal: { label: '间歇期', herbs: [['白术', '12g'], ['茯苓', '15g']] },
      chronic: { label: '久病反复', herbs: [['熟地黄', '15g'], ['山药', '20g']] },
    },
    signs: {
      '抽搐明显': { label: '抽搐明显', herbs: [['全蝎', '3g'], ['蜈蚣', '2条']] },
      '痰涎壅盛': { label: '痰涎壅盛', herbs: [['胆南星', '10g'], ['竹茹', '12g']] },
      '惊恐或情志诱发': { label: '情志诱发', herbs: [['柴胡', '10g'], ['合欢皮', '15g']] },
      '发作后疲乏': { label: '发作后疲乏', herbs: [['太子参', '20g'], ['山药', '20g']] },
      '夜间磨牙': { label: '夜间磨牙', herbs: [['牡蛎', '20g 先煎'], ['龙骨', '20g 先煎']] },
      '遗尿': { label: '遗尿', herbs: [['益智仁', '10g'], ['桑螵蛸', '10g']] },
      '舌红或舌暗': { label: '舌红或舌暗', herbs: [['丹参', '15g'], ['郁金', '10g']] },
      '外伤史': { label: '外伤史', herbs: [['土鳖虫', '6g'], ['鸡血藤', '20g']] },
    },
    constitutions: {
      '脾虚': { label: '脾虚', herbs: [['党参', '15g'], ['白术', '12g']] },
      '肾精不足': { label: '肾精不足', herbs: [['熟地黄', '15g'], ['龟甲', '15g 先煎']] },
      '痰湿偏盛': { label: '痰湿偏盛', herbs: [['法半夏', '12g'], ['陈皮', '10g']] },
      '瘀血明显': { label: '瘀血明显', herbs: [['丹参', '15g'], ['桃仁', '10g']] },
      '肝郁情志': { label: '肝郁情志', herbs: [['香附', '10g'], ['郁金', '10g']] },
    },
  },
  tremor: {
    phase: {
      progressive: { label: '渐进期', herbs: [['天麻', '10g'], ['钩藤', '15g']] },
      fluctuating: { label: '波动期', herbs: [['酸枣仁', '20g'], ['夜交藤', '20g']] },
      chronic: { label: '久病期', herbs: [['熟地黄', '15g'], ['杜仲', '12g']] },
    },
    signs: {
      '静止性震颤': { label: '静止性震颤', herbs: [['天麻', '10g'], ['全蝎', '3g']] },
      '动作性震颤': { label: '动作性震颤', herbs: [['钩藤', '15g'], ['白芍', '20g']] },
      '肌张力高或疼痛': { label: '筋脉拘急', herbs: [['伸筋草', '15g'], ['白芍', '20g']] },
      '双足发冷': { label: '双足发冷', herbs: [['附子', '6g 先煎'], ['桂枝', '10g']] },
      '头昏': { label: '头昏', herbs: [['石决明', '20g 先煎'], ['菊花', '10g']] },
      '便干': { label: '便干', herbs: [['火麻仁', '15g'], ['郁李仁', '10g']] },
      '睡眠不宁': { label: '睡眠不宁', herbs: [['夜交藤', '20g'], ['合欢皮', '15g']] },
      '焦虑易郁': { label: '焦虑易郁', herbs: [['柴胡', '10g'], ['香附', '10g']] },
    },
    constitutions: {
      '气虚阳虚': { label: '气虚阳虚', herbs: [['黄芪', '30g'], ['桂枝', '10g']] },
      '肾精不足': { label: '肾精不足', herbs: [['熟地黄', '15g'], ['山茱萸', '12g']] },
      '阴虚火旺': { label: '阴虚火旺', herbs: [['生地黄', '15g'], ['麦冬', '12g']] },
      '瘀血明显': { label: '瘀血明显', herbs: [['丹参', '20g'], ['鸡血藤', '20g']] },
      '肝郁情志': { label: '肝郁情志', herbs: [['郁金', '10g'], ['佛手', '10g']] },
    },
  },
  dementia: {
    phase: {
      early: { label: '早期健忘', herbs: [['远志', '10g'], ['石菖蒲', '12g']] },
      middle: { label: '中期认知下降', herbs: [['郁金', '10g'], ['丹参', '15g']] },
      late: { label: '久病期', herbs: [['熟地黄', '15g'], ['山茱萸', '12g']] },
    },
    signs: {
      '健忘走失': { label: '健忘走失', herbs: [['远志', '10g'], ['益智仁', '10g']] },
      '反应迟钝': { label: '反应迟钝', herbs: [['石菖蒲', '12g'], ['郁金', '10g']] },
      '言语含糊': { label: '言语含糊', herbs: [['僵蚕', '10g'], ['远志', '10g']] },
      '烦躁易怒': { label: '烦躁易怒', herbs: [['栀子', '10g'], ['牡丹皮', '10g']] },
      '痰多鼾声': { label: '痰多鼾声', herbs: [['胆南星', '10g'], ['法半夏', '12g']] },
      '口苦心悸': { label: '口苦心悸', herbs: [['黄连', '6g'], ['茯神', '15g']] },
      '头重如裹': { label: '头重如裹', herbs: [['泽泻', '15g'], ['茯苓', '20g']] },
      '舌胖腻': { label: '舌胖腻', herbs: [['佩兰', '10g'], ['藿香', '10g']] },
    },
    constitutions: {
      '肾精不足': { label: '肾精不足', herbs: [['熟地黄', '15g'], ['枸杞子', '12g']] },
      '脾虚': { label: '脾虚', herbs: [['党参', '15g'], ['白术', '12g']] },
      '阴虚火旺': { label: '阴虚火旺', herbs: [['生地黄', '15g'], ['知母', '10g']] },
      '痰湿偏盛': { label: '痰湿偏盛', herbs: [['法半夏', '12g'], ['陈皮', '10g']] },
      '瘀血明显': { label: '瘀血明显', herbs: [['丹参', '20g'], ['桃仁', '10g']] },
    },
  },
  insomnia: {
    phase: {
      acute: { label: '近期失眠', herbs: [['栀子', '10g'], ['淡豆豉', '12g']] },
      recurrent: { label: '反复失眠', herbs: [['酸枣仁', '20g'], ['夜交藤', '20g']] },
      chronic: { label: '久病期', herbs: [['茯神', '15g'], ['柏子仁', '15g']] },
    },
    signs: {
      '入睡困难': { label: '入睡困难', herbs: [['酸枣仁', '20g'], ['夜交藤', '20g']] },
      '早醒多梦': { label: '早醒多梦', herbs: [['柏子仁', '15g'], ['合欢皮', '15g']] },
      '情绪郁结': { label: '情绪郁结', herbs: [['柴胡', '10g'], ['香附', '10g']] },
      '健忘': { label: '健忘', herbs: [['远志', '10g'], ['石菖蒲', '10g']] },
      '口干': { label: '口干', herbs: [['麦冬', '12g'], ['生地黄', '15g']] },
      '劳累后头痛': { label: '劳后头痛', herbs: [['黄芪', '20g'], ['川芎', '10g']] },
      '乏力纳差': { label: '乏力纳差', herbs: [['党参', '15g'], ['白术', '12g']] },
      '胸闷嗳气': { label: '胸闷嗳气', herbs: [['陈皮', '10g'], ['佛手', '10g']] },
    },
    constitutions: {
      '阴虚火旺': { label: '阴虚火旺', herbs: [['生地黄', '15g'], ['知母', '10g']] },
      '脾虚': { label: '脾虚', herbs: [['党参', '15g'], ['白术', '12g']] },
      '气虚阳虚': { label: '气虚阳虚', herbs: [['黄芪', '20g'], ['桂圆肉', '12g']] },
      '肝郁情志': { label: '肝郁情志', herbs: [['郁金', '10g'], ['合欢皮', '15g']] },
      '痰湿偏盛': { label: '痰湿偏盛', herbs: [['法半夏', '12g'], ['茯苓', '20g']] },
    },
  },
  vertigo: {
    phase: {
      acute: { label: '急性发作', herbs: [['天麻', '10g'], ['钩藤', '15g']] },
      recurrent: { label: '反复发作', herbs: [['泽泻', '15g'], ['茯苓', '20g']] },
      chronic: { label: '久病缠绵', herbs: [['黄芪', '20g'], ['白术', '12g']] },
    },
    signs: {
      '头重如裹': { label: '头重如裹', herbs: [['法半夏', '12g'], ['茯苓', '20g']] },
      '头痛目眩': { label: '头痛目眩', herbs: [['川芎', '10g'], ['菊花', '10g']] },
      '恶心欲吐': { label: '恶心欲吐', herbs: [['竹茹', '12g'], ['陈皮', '10g']] },
      '痰多胸闷': { label: '痰多胸闷', herbs: [['瓜蒌皮', '15g'], ['枳壳', '10g']] },
      '耳鸣': { label: '耳鸣', herbs: [['磁石', '20g 先煎'], ['女贞子', '12g']] },
      '血脂偏高或肥甘厚味': { label: '肥甘厚味', herbs: [['山楂', '15g'], ['决明子', '15g']] },
      '肢体麻木': { label: '肢体麻木', herbs: [['地龙', '10g'], ['鸡血藤', '20g']] },
      '舌腻': { label: '舌腻', herbs: [['佩兰', '10g'], ['藿香', '10g']] },
    },
    constitutions: {
      '脾虚': { label: '脾虚', herbs: [['党参', '15g'], ['白术', '12g']] },
      '阴虚火旺': { label: '阴虚火旺', herbs: [['生地黄', '15g'], ['石斛', '12g']] },
      '痰湿偏盛': { label: '痰湿偏盛', herbs: [['法半夏', '12g'], ['陈皮', '10g']] },
      '瘀血明显': { label: '瘀血明显', herbs: [['丹参', '20g'], ['郁金', '10g']] },
      '肝郁情志': { label: '肝郁情志', herbs: [['柴胡', '10g'], ['香附', '10g']] },
    },
  },
};

function normalizeHerbName(name) {
  return name.replace(/\s+/g, '').split('/')[0];
}

function pushUniqueHerb(items, herb, source) {
  const [name, dose] = herb;
  const normalized = normalizeHerbName(name);
  if (items.some((item) => normalizeHerbName(item.name) === normalized)) {
    return;
  }

  items.push({ name, dose, source });
}

export function resolvePathwayFormula(pathway, answers) {
  const baseHerbs = (pathway.formula.herbs || []).map(([name, dose]) => ({ name, dose, source: 'base' }));
  const moduleRules = formulaVariationRules[pathway.module] || {};
  const adjustmentNotes = [];
  const herbsDetailed = [...baseHerbs];

  const matchedRules = [];

  const phaseRule = moduleRules.phase?.[answers.phase];
  if (phaseRule) {
    matchedRules.push({ category: '病势', ...phaseRule });
  }

  answers.signs.slice(0, 3).forEach((sign) => {
    const rule = moduleRules.signs?.[sign];
    if (rule) {
      matchedRules.push({ category: '主症', ...rule });
    }
  });

  answers.constitutions.slice(0, 3).forEach((constitution) => {
    const rule = moduleRules.constitutions?.[constitution];
    if (rule) {
      matchedRules.push({ category: '证素', ...rule });
    }
  });

  matchedRules.slice(0, 5).forEach((rule) => {
    const addedNames = [];
    rule.herbs.forEach((herb) => {
      const beforeCount = herbsDetailed.length;
      pushUniqueHerb(herbsDetailed, herb, 'adjusted');
      if (herbsDetailed.length > beforeCount) {
        addedNames.push(herb[0]);
      }
    });

    if (addedNames.length > 0) {
      adjustmentNotes.push(`${rule.category}命中“${rule.label}”，本次加减偏向 ${addedNames.join('、')}。`);
    }
  });

  return {
    ...pathway.formula,
    herbsDetailed,
    adjustmentNotes,
  };
}

export function createAnswers(moduleId) {
  return {
    ...initialAnswers,
    module: moduleId,
    signs: [],
    constitutions: [],
    redflags: [],
  };
}

export function toggleMultiValue(values, nextValue) {
  return values.includes(nextValue)
    ? values.filter((value) => value !== nextValue)
    : [...values, nextValue];
}

export function validateStep(stepKey, answers) {
  if (stepKey === 'module' && !answers.module) {
    return '请先选择一个病种路径。';
  }

  if (stepKey === 'phase' && !answers.phase) {
    return '请先选择病期。';
  }

  if (stepKey === 'signs' && answers.signs.length === 0) {
    return '至少选择 1 个关键症状。';
  }

  return '';
}

export function getAvailableModules(master) {
  return [...new Set(master.pathways.map((pathway) => pathway.module))];
}

export function scorePathway(pathway, answers) {
  let score = 0;

  if (pathway.module === answers.module) {
    score += 2;
  }

  if (pathway.phase.includes(answers.phase)) {
    score += 2;
  }

  score += pathway.signs.filter((item) => answers.signs.includes(item)).length * 1.35;
  score += pathway.constitutions.filter((item) => answers.constitutions.includes(item)).length * 1.1;
  return score;
}

export function computeResult(master, answers) {
  if (answers.redflags.length > 0) {
    return {
      type: 'emergency',
      title: '先做急重症分流',
      narrative: '当前输入出现了脑病相关急重风险信号，必须优先急诊评估，而不是继续辨证学习。',
      actions: [
        '立即转入急诊 / 卒中中心 / 神经专科评估。',
        '本站只保留学术说明，不继续显示学习方路。',
        '待病情稳定、影像和实验室资料明确后，再回到学习模块。',
      ],
      evidence: master.sources.slice(0, 2),
    };
  }

  const candidates = master.pathways
    .filter((item) => item.module === answers.module)
    .map((item) => ({
      ...item,
      score: scorePathway(item, answers),
      resolvedFormula: resolvePathwayFormula(item, answers),
    }))
    .sort((a, b) => b.score - a.score);

  return {
    type: 'pathway',
    best: candidates[0],
    alternative: candidates[1] || null,
  };
}

export function getStepOptions(stepKey, answers, master) {
  if (stepKey === 'module') {
    return getAvailableModules(master).map((id) => ({
      id,
      label: moduleMeta[id].label,
      note: moduleMeta[id].prompt,
    }));
  }

  if (stepKey === 'phase' && answers.module) {
    return moduleMeta[answers.module].phases;
  }

  if (stepKey === 'signs' && answers.module) {
    return moduleMeta[answers.module].signs;
  }

  if (stepKey === 'constitutions' && answers.module) {
    return moduleMeta[answers.module].constitutions;
  }

  return [];
}
