import { initialAnswers, moduleMeta } from '../data/catalog';

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
