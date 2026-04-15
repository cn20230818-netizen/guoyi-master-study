import { useEffect, useState } from 'react';
import {
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { masters, moduleMeta, commonRedflags, orderedMasterIds } from './src/data/catalog';
import { computeResult, createAnswers, getAvailableModules, toggleMultiValue, validateStep } from './src/lib/engine';

const siteLinks = {
  website: 'https://www.guoyinaobing.cn',
  privacy: 'https://www.guoyinaobing.cn/privacy-policy.html',
  support: 'https://www.guoyinaobing.cn/support.html',
  github: 'https://github.com/cn20230818-netizen/guoyi-master-study',
};

const copyrightNotice =
  '版权说明：本站内容由项目维护者基于公开可核验资料整理。原始论文、期刊页面、机构资料、公开转载医案及其题名、摘要、图片等相关权利归原作者、原期刊、原机构或原发布平台所有。本站仅作学术传承、教学演练与研究浏览使用；如有版权异议、资料更正或下架请求，请联系 cn20230818@gmail.com。';

const navItems = [
  { label: '首页', path: '/' },
  { label: '三家学脉', path: '/masters' },
  { label: '研习入口', path: '/study' },
  { label: '研究方法', path: '/method' },
  { label: '隐私与支持', external: siteLinks.support },
];

const studySteps = [
  { key: 'redflags', nav: '先辨缓急', title: '先辨缓急', subtitle: '若出现急性偏瘫、意识障碍、爆炸样头痛、持续抽搐、高热抽搐、胸痛呼吸困难等情况，应先急诊评估。' },
  { key: 'module', nav: '次辨病门', title: '次辨病门', subtitle: '请先决定当前更接近哪一类脑病入口。不同病门，决定后续病机解释与学派偏向。' },
  { key: 'phase', nav: '再定病势', title: '再定病势', subtitle: '同一病门，不同阶段，其治法轻重与病机主轴并不相同。请先判断当前更接近发作期、恢复期、反复期还是久病期。' },
  { key: 'signs', nav: '取其主症', title: '取其主症', subtitle: '不要把所有表现都选满。请只保留最能决定病机方向的 1 到 4 个关键线索。' },
  { key: 'constitutions', nav: '定其证素', title: '定其证素', subtitle: '这里选择的不是表面症状，而是底层证素。脑病最难之处，往往就在于本虚与标实同时存在。' },
];

const researchCards = [
  {
    title: '资料来源',
    body: [
      '官方机构页',
      '官方转载医案',
      '期刊官网摘要页',
      '论文题录与目录线索',
    ],
  },
  {
    title: '整理原则',
    body: [
      '只提炼反复出现的病机主轴',
      '不把孤例当作通则',
      '原案只用于文献研读展示',
    ],
  },
  {
    title: '资料边界',
    body: [
      '不宣称已完整通读知网全部全文',
      '不替代临床问诊',
      '不自动输出现实个体处方',
    ],
  },
  {
    title: '本站定位',
    body: [
      '学术传承',
      '教学演练',
      '研究浏览',
    ],
  },
];

const homeGuideCards = [
  {
    step: '第一步',
    title: '先定所宗之学脉',
    text: '先看哪位大师与你希望理解的脑病路径最相近。',
  },
  {
    step: '第二步',
    title: '次辨病门与病势',
    text: '从中风、痫证、颤证、痴呆、失眠、眩晕等入口进入，再区分急缓阶段。',
  },
  {
    step: '第三步',
    title: '再取主症与证素',
    text: '不堆症状，只抓真正决定病机方向的线索。',
  },
  {
    step: '第四步',
    title: '终观病机与方义',
    text: '结果呈现的是学术路径、治法骨架与公开原案脉络，而不是面向真实患者的处方输出。',
  },
];

const homeValueCards = [
  {
    title: '学术传承',
    text: '把三位国医大师脑病相关的公开资料，从“零散可查”整理成“可阅读、可比较、可回溯”的结构。',
  },
  {
    title: '教学演示',
    text: '适合课堂讲授、病例讨论、带教演练与学术展示。',
  },
  {
    title: '研究浏览',
    text: '每条路径都附公开资料线索，便于继续回看来源，而不是只停留在站内结果。',
  },
];

const heroMottos = ['脑当为脏', '六辨七治', '痰瘀热风同参'];

const masterVisuals = {
  zhang: {
    accent: '#b65543',
    mood: '朱砂印色',
    line: '脑络金线',
    summary: '把脑病从附属脏腑论提升为独立病机中心，以脑络、水瘀、痰瘀统摄中风、痫证、眩晕与痴呆。',
  },
  liu: {
    accent: '#6c8794',
    mood: '黛青格序',
    line: '体系学派',
    summary: '擅长把恢复期、后遗期和虚实夹杂证分层拆解，将证素、治法和高频用药规律系统化。',
  },
  tu: {
    accent: '#8c7d5f',
    mood: '玄青机变',
    line: '云气流转',
    summary: '将急症思维与脑病慢病化裁贯通，尤其见长于眩晕、痴呆、失眠等脑病与神志病过渡区域。',
  },
};

function normalizePath(path) {
  if (!path) {
    return '/';
  }

  const clean = path.split('?')[0].split('#')[0];
  if (clean === '/') {
    return '/';
  }

  return clean.endsWith('/') ? clean.slice(0, -1) : clean;
}

function getInitialPath() {
  if (typeof window === 'undefined') {
    return '/';
  }

  return normalizePath(window.location.pathname);
}

function useSiteRouter() {
  const [path, setPath] = useState(getInitialPath);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handlePopState = () => {
      setPath(normalizePath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (nextPath) => {
    const normalized = normalizePath(nextPath);

    if (typeof window !== 'undefined' && normalized !== path) {
      window.history.pushState({}, '', normalized);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setPath(normalized);
  };

  return { path, navigate };
}

function getMasterIdFromPath(path) {
  const match = path.match(/^\/masters\/([^/]+)$/);
  if (!match) {
    return null;
  }

  return orderedMasterIds.includes(match[1]) ? match[1] : null;
}

function masterAnswerState(masterId) {
  const master = masters[masterId];
  const firstModule = getAvailableModules(master)[0] || null;
  return createAnswers(firstModule);
}

function classifySource(source) {
  const title = source.title || '';
  const note = source.note || '';

  if (note.includes('官方转载') || note.includes('含完整处方') || title.includes('经验')) {
    return { type: '官方转载医案', usage: '临证原案' };
  }

  if (note.includes('官方页面') || title.includes('工作室') || title.includes('学术思想') || title.includes('卫健委')) {
    return { type: '机构官方资料', usage: '学术背景' };
  }

  if (note.includes('期刊官网摘要')) {
    return {
      type: '期刊官网摘要',
      usage: title.includes('规律') ? '用药规律' : '病机阐释',
    };
  }

  if (note.includes('目录') || title.includes('目录')) {
    return { type: '文献目录索引', usage: '检索线索' };
  }

  return { type: '公开资料', usage: '参考线索' };
}

function buildResultCopy(master, best, selectedModule, answers) {
  const phaseLabel = selectedModule?.phases.find((item) => item.id === answers.phase)?.label || '未标定';
  const matchedSigns = best.signs.filter((item) => answers.signs.includes(item));
  const matchedConstitutions = best.constitutions.filter((item) => answers.constitutions.includes(item));
  const symptomText = matchedSigns.length ? matchedSigns.join('、') : '当前主症资料仍偏少';
  const constitutionText = matchedConstitutions.length ? matchedConstitutions.join('、') : '当前证素资料仍待补充';

  return {
    phaseLabel,
    matchedSigns,
    matchedConstitutions,
    heading: `更接近 ${master.name} 的 ${best.label}`,
    subheading: '你的输入在病门、病势与病机主轴上，更符合这一学术路径。',
    reasoning: [
      {
        title: '病种判断',
        text: `你所选择的病门为“${selectedModule?.label || '未标定病门'}”，决定了当前首先进入这一类脑病路径。`,
      },
      {
        title: '病期判断',
        text: `你所标记的阶段为“${phaseLabel}”，使辨证重点偏向当前这一病程层次。`,
      },
      {
        title: '主症判断',
        text: `你所选择的主症与伴随线索为“${symptomText}”，提示了该路径中更高频出现的病机线索。`,
      },
      {
        title: '证素判断',
        text: `你所勾选的证素为“${constitutionText}”，显示本虚与标实的重心更接近这一家学脉。`,
      },
    ],
    completeness:
      answers.constitutions.length < 2 || answers.signs.length < 2
        ? '当前未输入舌脉、寒热、诱因、睡眠与二便等信息，本结果为学习性粗分层。'
        : '当前已具备基本辨机线索，但仍建议结合舌脉、寒热、诱因与二便资料继续细分。',
  };
}

function buildFormulaMeaning(master, best, copy) {
  const constitutions = copy.matchedConstitutions.length ? copy.matchedConstitutions.join('、') : '本虚与标实并见';
  const signs = copy.matchedSigns.length ? copy.matchedSigns.join('、') : '当前病门的高频线索';
  return `此路以“${best.therapeutic}”为主轴，用来回应 ${constitutions} 与 ${signs} 所指向的病机组合，重点不在套用成方，而在把病机、治法与方义对应起来。`;
}

function App() {
  const { width } = useWindowDimensions();
  const { path, navigate } = useSiteRouter();
  const detailMasterId = getMasterIdFromPath(path);
  const [studyMasterId, setStudyMasterId] = useState('zhang');
  const [answers, setAnswers] = useState(masterAnswerState('zhang'));
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [errorText, setErrorText] = useState('');
  const [formulaExpanded, setFormulaExpanded] = useState(false);

  const isWide = width >= 1040;
  const isTablet = width >= 720;
  const studyMaster = masters[studyMasterId];
  const selectedModule = answers.module ? moduleMeta[answers.module] : null;
  const currentStep = studySteps[stepIndex];

  const navigateToStudyWithMaster = (masterId) => {
    setStudyMasterId(masterId);
    setAnswers(masterAnswerState(masterId));
    setStepIndex(0);
    setResult(null);
    setErrorText('');
    setFormulaExpanded(false);
    navigate('/study');
  };

  const switchStudyMaster = (masterId) => {
    setStudyMasterId(masterId);
    setAnswers(masterAnswerState(masterId));
    setStepIndex(0);
    setResult(null);
    setErrorText('');
    setFormulaExpanded(false);
  };

  const updateSingleValue = (key, value) => {
    setAnswers((current) => {
      const next = { ...current, [key]: value };

      if (key === 'module') {
        next.phase = null;
        next.signs = [];
        next.constitutions = [];
      }

      return next;
    });
    setErrorText('');
    setResult(null);
    setFormulaExpanded(false);
  };

  const updateMultiValue = (key, value) => {
    setAnswers((current) => ({
      ...current,
      [key]: toggleMultiValue(current[key], value),
    }));
    setErrorText('');
    setResult(null);
    setFormulaExpanded(false);
  };

  const goNext = () => {
    const nextError = validateStep(currentStep.key, answers);

    if (nextError) {
      setErrorText(nextError);
      return;
    }

    if (stepIndex < studySteps.length - 1) {
      setStepIndex((current) => current + 1);
      setErrorText('');
      return;
    }

    setResult(computeResult(studyMaster, answers));
    setErrorText('');
    setFormulaExpanded(false);
  };

  const goPrev = () => {
    if (stepIndex === 0) {
      return;
    }

    setStepIndex((current) => current - 1);
    setErrorText('');
  };

  const openExternal = async (url) => {
    await Linking.openURL(url);
  };

  const renderEvidenceCards = (sourceList) => (
    <View style={[styles.evidenceGrid, isTablet && styles.evidenceGridWide]}>
      {sourceList.map((source) => {
        const meta = classifySource(source);
        return (
          <Pressable key={`${source.title}-${source.url}`} style={styles.evidenceCard} onPress={() => openExternal(source.url)}>
            <View style={styles.evidenceTagRow}>
              <Text style={styles.evidenceTypeTag}>{meta.type}</Text>
              <Text style={styles.evidenceUsageTag}>{meta.usage}</Text>
            </View>
            <Text style={styles.evidenceTitle}>{source.title}</Text>
            <Text style={styles.evidenceNote}>{source.note}</Text>
            <Text style={styles.evidenceLink}>查看原文</Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderFormulaPanel = (formula) => {
    const kindCopy = {
      case: {
        heading: '公开医案原方摘录',
        subheading: '出自公开转载病例，仅用于文献研读。',
      },
      rule: {
        heading: '高频用药规律',
        subheading: '这是规律层，不是统一门诊原方。',
      },
      template: {
        heading: '方路模板',
        subheading: '重点看这类方为什么适合该路径。',
      },
    };

    const currentKind = kindCopy[formula.kind] || kindCopy.template;
    const isCase = formula.kind === 'case';

    return (
        <View style={styles.primaryPanel}>
        <Text style={styles.panelEyebrow}>公开原案层</Text>
        <Text style={styles.primaryPanelTitle}>{currentKind.heading}</Text>
        <Text style={styles.primaryPanelText}>{currentKind.subheading}</Text>
        <Text style={styles.primaryPanelText}>方义结构：{formula.title}</Text>

        {isCase ? (
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>以下为公开医案原案摘录，仅供文献学习，不对应当前真实个体。</Text>
            <Pressable style={styles.secondaryButton} onPress={() => setFormulaExpanded((current) => !current)}>
              <Text style={styles.secondaryButtonText}>
                {formulaExpanded ? '收起原案' : '展开原案摘录'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {(!isCase || formulaExpanded) && (
          <>
            <View style={[styles.formulaGrid, isWide && styles.formulaGridWide]}>
              {formula.herbs.map(([name, dose]) => (
                <View key={`${formula.title}-${name}`} style={styles.formulaItem}>
                  <Text style={styles.formulaName}>{name}</Text>
                  <Text style={styles.formulaDose}>{dose}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.primaryPanelText}>{formula.usage}</Text>
          </>
        )}

        {!isCase ? <Text style={styles.primaryPanelText}>{formula.caution}</Text> : null}
      </View>
    );
  };

  const renderStudyStep = () => {
    if (currentStep.key === 'redflags') {
      return (
        <View style={styles.stepSection}>
          <Text style={styles.sectionDescription}>{currentStep.subtitle}</Text>
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>若存在急性偏瘫、意识障碍、爆炸样头痛、高热抽搐等风险，应优先急诊评估。</Text>
          </View>
          <Text style={styles.inlineNote}>如无急重信号，再继续后续研习。</Text>
          <ChipGrid
            options={commonRedflags}
            values={answers.redflags}
            onPress={(value) => updateMultiValue('redflags', value)}
          />
        </View>
      );
    }

    if (currentStep.key === 'module') {
      const options = getAvailableModules(studyMaster).map((id) => ({
        id,
        label: moduleMeta[id].label,
        note: moduleMeta[id].prompt,
      }));

      return (
        <View style={styles.stepSection}>
          <Text style={styles.sectionDescription}>{currentStep.subtitle}</Text>
          {options.map((option) => (
            <Pressable
              key={option.id}
              style={[styles.optionCard, answers.module === option.id && styles.optionCardSelected]}
              onPress={() => updateSingleValue('module', option.id)}
            >
              <Text style={styles.optionTitle}>{option.label}</Text>
              <Text style={styles.optionMeta}>{option.note}</Text>
            </Pressable>
          ))}
        </View>
      );
    }

    if (currentStep.key === 'phase' && selectedModule) {
      return (
        <View style={styles.stepSection}>
          <Text style={styles.sectionDescription}>{currentStep.subtitle}</Text>
          {selectedModule.phases.map((option) => (
            <Pressable
              key={option.id}
              style={[styles.optionCard, answers.phase === option.id && styles.optionCardSelected]}
              onPress={() => updateSingleValue('phase', option.id)}
            >
              <Text style={styles.optionTitle}>{option.label}</Text>
              <Text style={styles.optionMeta}>{option.note}</Text>
            </Pressable>
          ))}
        </View>
      );
    }

    if (currentStep.key === 'signs' && selectedModule) {
      return (
        <View style={styles.stepSection}>
          <Text style={styles.sectionDescription}>{currentStep.subtitle}</Text>
          <DualColumnCard
            leftTitle="主导症状"
            rightTitle="伴随线索"
            leftContent={
              <ChipGrid options={selectedModule.majorSigns} values={answers.signs} onPress={(value) => updateMultiValue('signs', value)} />
            }
            rightContent={
              <ChipGrid options={selectedModule.companionSigns} values={answers.signs} onPress={(value) => updateMultiValue('signs', value)} />
            }
          />
        </View>
      );
    }

    if (currentStep.key === 'constitutions' && selectedModule) {
      return (
        <View style={styles.stepSection}>
          <Text style={styles.sectionDescription}>{currentStep.subtitle}</Text>
          <DualColumnCard
            leftTitle="本虚因素"
            rightTitle="标实因素"
            leftContent={
              <ChipGrid
                options={selectedModule.deficiencyFactors}
                values={answers.constitutions}
                onPress={(value) => updateMultiValue('constitutions', value)}
              />
            }
            rightContent={
              <ChipGrid
                options={selectedModule.excessFactors}
                values={answers.constitutions}
                onPress={(value) => updateMultiValue('constitutions', value)}
              />
            }
          />
        </View>
      );
    }

    return null;
  };

  const renderStudyResult = () => {
    if (!result) {
      return (
        <View style={styles.secondaryPanel}>
          <Text style={styles.panelEyebrow}>结果预位</Text>
          <Text style={styles.secondaryPanelTitle}>终观病机与方义</Text>
          <Text style={styles.secondaryPanelText}>完成五步之后，这里会按“结论—推理—治法—原案—证据”的层级展开学术路径。</Text>
        </View>
      );
    }

    if (result.type === 'emergency') {
      return (
        <View style={styles.primaryPanel}>
          <Text style={styles.panelEyebrow}>危候分流</Text>
          <Text style={styles.primaryPanelTitle}>先行急重分流</Text>
          <Text style={styles.primaryPanelText}>当前输入出现脑病相关风险信号，应优先急诊评估，而非继续学习性分型。</Text>
          {result.actions.map((item) => (
            <Text key={item} style={styles.primaryPanelBullet}>• {item}</Text>
          ))}
          {renderEvidenceCards(result.evidence)}
        </View>
      );
    }

    const best = result.best;
    const alternative = result.alternative;
    const copy = buildResultCopy(studyMaster, best, selectedModule, answers);

    return (
      <View style={styles.resultStack}>
        <View style={styles.primaryPanel}>
          <Text style={styles.panelEyebrow}>结论</Text>
          <Text style={styles.primaryPanelTitle}>{copy.heading}</Text>
          <Text style={styles.primaryPanelText}>{copy.subheading}</Text>
          <View style={styles.tagRow}>
            <Tag text={selectedModule?.label || '病门未定'} />
            <Tag text={copy.phaseLabel} />
            <Tag text={best.therapeutic} />
          </View>
        </View>

        <View style={styles.secondaryPanel}>
          <Text style={styles.panelEyebrow}>推理链</Text>
          <Text style={styles.secondaryPanelTitle}>辨证推理过程</Text>
          {copy.reasoning.map((item) => (
            <View key={item.title} style={styles.reasonCard}>
              <Text style={styles.reasonTitle}>{item.title}</Text>
              <Text style={styles.reasonText}>{item.text}</Text>
            </View>
          ))}
          <View style={styles.warningCard}>
            <Text style={styles.warningText}>{copy.completeness}</Text>
          </View>
        </View>

        <View style={styles.secondaryPanel}>
          <Text style={styles.panelEyebrow}>学术解释</Text>
          <Text style={styles.secondaryPanelTitle}>这一家为何这样看</Text>
          <Text style={styles.secondaryPanelText}>{studyMaster.academicInterpretation}</Text>
          <Text style={styles.secondaryPanelText}>{best.narrative}</Text>
        </View>

        <View style={styles.secondaryPanel}>
          <Text style={styles.panelEyebrow}>治法骨架</Text>
          <Text style={styles.secondaryPanelTitle}>治法与方义</Text>
          <Text style={styles.secondaryPanelText}>治法主轴：{best.therapeutic}</Text>
          <Text style={styles.secondaryPanelText}>方义核心：{buildFormulaMeaning(studyMaster, best, copy)}</Text>
          <Text style={styles.secondaryPanelText}>学习提示：{copy.completeness}</Text>
        </View>

        {renderFormulaPanel(best.formula)}

        {alternative ? (
          <View style={styles.secondaryPanel}>
            <Text style={styles.panelEyebrow}>备选路径</Text>
            <Text style={styles.secondaryPanelTitle}>若补足资料，还可对照此路</Text>
            <Text style={styles.secondaryPanelText}>
              若后续补充舌脉、寒热、情志、二便、既往史与诱因，还可与 {alternative.label} 进一步比较。
            </Text>
          </View>
        ) : null}

        <View style={styles.secondaryPanel}>
          <Text style={styles.panelEyebrow}>证据来源</Text>
          <Text style={styles.secondaryPanelTitle}>此页所据公开资料</Text>
          {renderEvidenceCards(studyMaster.sources)}
        </View>
      </View>
    );
  };

  const currentPage =
    path === '/'
      ? (
        <HomePage
          isWide={isWide}
          isTablet={isTablet}
          navigate={navigate}
        />
      )
      : path === '/masters'
        ? <MastersPage isWide={isWide} navigate={navigate} />
        : detailMasterId
          ? (
            <MasterDetailPage
              masterId={detailMasterId}
              isWide={isWide}
              isTablet={isTablet}
              navigateToStudyWithMaster={navigateToStudyWithMaster}
              renderEvidenceCards={renderEvidenceCards}
            />
          )
          : path === '/study'
            ? (
              <StudyPage
                isWide={isWide}
                isTablet={isTablet}
                studyMasterId={studyMasterId}
                switchStudyMaster={switchStudyMaster}
                currentStep={currentStep}
                stepIndex={stepIndex}
                answers={answers}
                errorText={errorText}
                goPrev={goPrev}
                goNext={goNext}
                renderStudyStep={renderStudyStep}
                renderStudyResult={renderStudyResult}
              />
            )
            : path === '/method'
              ? <MethodPage isWide={isWide} navigate={navigate} />
              : <NotFoundPage navigate={navigate} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.appShell}>
        <SiteHeader currentPath={path} navigate={navigate} openExternal={openExternal} />
        <ScrollView contentContainerStyle={[styles.pageScroll, isWide && styles.pageScrollWide]} showsVerticalScrollIndicator={false}>
          <View style={styles.backdropLayer}>
            <View style={styles.mountainOne} />
            <View style={styles.mountainTwo} />
            <View style={styles.mountainThree} />
            <View style={styles.cloudRibbonOne} />
            <View style={styles.cloudRibbonTwo} />
          </View>
          {currentPage}
          <SiteFooter navigate={navigate} openExternal={openExternal} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function SiteHeader({ currentPath, navigate, openExternal }) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.brandMark} onPress={() => navigate('/')}>
        <View style={styles.brandSeal}>
          <Text style={styles.brandSealText}>馆</Text>
        </View>
        <View style={styles.brandCopy}>
          <Text style={styles.brandTitle}>国医大师脑病学术传承馆</Text>
          <Text style={styles.brandSubTitle}>暗金山水 · 学脉展卷</Text>
        </View>
      </Pressable>

      <View style={styles.navRow}>
        {navItems.map((item) => {
          const active = item.path ? (item.path === '/' ? currentPath === '/' : currentPath.startsWith(item.path)) : false;
          return (
            <Pressable
              key={item.path || item.external}
              style={[styles.navLink, active && styles.navLinkActive]}
              onPress={() => (item.external ? openExternal(item.external) : navigate(item.path))}
            >
              <Text style={[styles.navLinkText, active && styles.navLinkTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function HomePage({ isWide, isTablet, navigate }) {
  return (
    <View style={styles.pageStack}>
      <View style={[styles.heroPanel, isWide && styles.heroPanelWide]}>
        <View style={[styles.heroGrid, isWide && styles.heroGridWide]}>
          <View style={styles.heroMain}>
            <Text style={styles.eyebrow}>卷首第一屏</Text>
            <Text style={styles.heroTitle}>国医大师脑病学术传承馆</Text>
            <Text style={styles.heroLead}>三位国医大师，三家脑病学脉，一卷可研。</Text>
            <Text style={styles.heroCaption}>
              以张学文、刘祖贻、凃晋文三位国医大师为轴，依据公开文献、官方转载医案与代表性学术思想，重构脑病辨证的主轴、治法与方义脉络。
            </Text>
            <Text style={styles.heroCaption}>供学术学习、教学演示与研究浏览，不替代真实临床诊疗。</Text>
            <View style={styles.heroButtonRow}>
              <PrimaryButton text="进入研习" onPress={() => navigate('/study')} />
              <SecondaryButton text="浏览三家学脉" onPress={() => navigate('/masters')} />
            </View>
          </View>

          <View style={styles.infoPlaque}>
            <Text style={styles.plaqueEyebrow}>展签</Text>
            <Text style={styles.plaqueTitle}>三位国医大师</Text>
            <Text style={styles.plaqueLine}>六大脑病入口</Text>
            <Text style={styles.plaqueLine}>公开资料映射</Text>
            <Text style={styles.plaqueLine}>学术演练，不代临床</Text>
          </View>
        </View>
        <View style={styles.heroMottoRow}>
          {heroMottos.map((item) => (
            <Text key={item} style={styles.heroMotto}>{item}</Text>
          ))}
        </View>
      </View>

      <SectionHeading eyebrow="Masters" title="三位国医大师，三种脑病视角" />
      <Text style={styles.sectionLead}>同为脑病，立论各异。有人以脑立脏，有人重本虚标实，有人长于急慢转换。</Text>
      <Text style={styles.sectionLead}>本站所做，不是把三家混成一套普通辨证，而是尽可能保留各自的学术骨相。</Text>
      <View style={[styles.tripleGrid, isWide && styles.tripleGridWide]}>
        {orderedMasterIds.map((masterId) => (
          <MasterPreviewCard
            key={masterId}
            master={masters[masterId]}
            visual={masterVisuals[masterId]}
            onDetail={() => navigate(`/masters/${masterId}`)}
          />
        ))}
      </View>

      <SectionHeading eyebrow="Method" title="资料从何而来" />
      <Text style={styles.sectionLead}>
        学术传承的第一步，不是做漂亮界面，而是诚实说明：哪些材料已经核对，哪些材料只能作为题录线索，哪些结论属于公开资料上的高频提炼。
      </Text>
      <View style={[styles.methodPreviewGrid, isTablet && styles.methodPreviewGridWide]}>
        {researchCards.map((item) => (
          <MethodCard key={item.title} title={item.title} items={item.body} />
        ))}
      </View>
      <Text style={styles.sectionLead}>
        本站当前关于资料边界的表达，直接承接现有研究说明：不能诚实宣称已读完知网所有出现姓名的全文论文，这一点本身就是可信度来源。
      </Text>
      <View style={styles.centerRow}>
        <SecondaryButton text="查看研究方法" onPress={() => navigate('/method')} />
      </View>

      <SectionHeading eyebrow="Guide" title="如何进入这一卷学问" />
      <View style={[styles.dualGrid, isTablet && styles.dualGridWide]}>
        {homeGuideCards.map((item) => (
          <GuideCard key={item.step} step={item.step} title={item.title} text={item.text} />
        ))}
      </View>

      <SectionHeading eyebrow="Value" title="为什么值得用它学习" />
      <View style={[styles.tripleGrid, isWide && styles.tripleGridWide]}>
        {homeValueCards.map((item) => (
          <FeatureCard key={item.title} title={item.title} text={item.text} />
        ))}
      </View>

      <SectionHeading eyebrow="Study" title="从病门、病势、主症与证素出发" />
      <Text style={styles.sectionLead}>看看你的输入，更接近哪一家学脉，哪一种病机路径。</Text>
      <View style={styles.centerRow}>
        <PrimaryButton text="进入研习" onPress={() => navigate('/study')} />
      </View>
    </View>
  );
}

function MastersPage({ isWide, navigate }) {
  return (
    <View style={styles.pageStack}>
      <PageIntro
        eyebrow="三家学脉"
        title="三位国医大师，三种脑病视角"
        description="同为脑病，立论各异。有人以脑立脏，有人重本虚标实，有人长于急慢转换。这里尽可能保留三家各自的学术骨相。"
      />

      <View style={[styles.tripleGrid, isWide && styles.tripleGridWide]}>
        {orderedMasterIds.map((masterId) => (
          <MasterPreviewCard
            key={masterId}
            master={masters[masterId]}
            visual={masterVisuals[masterId]}
            onDetail={() => navigate(`/masters/${masterId}`)}
          />
        ))}
      </View>
    </View>
  );
}

function MasterDetailPage({ masterId, isWide, isTablet, navigateToStudyWithMaster, renderEvidenceCards }) {
  const master = masters[masterId];
  const visual = masterVisuals[masterId];

  return (
    <View style={styles.pageStack}>
      <View style={[styles.heroPanel, styles.masterHero]}>
        <Text style={styles.heroTitle}>{master.name}</Text>
        <Text style={styles.masterSubTitle}>{master.title}</Text>
        <Text style={[styles.heroLead, styles.masterHeroLead]}>{master.doctrine}</Text>
        {master.detailIntro.map((paragraph) => (
          <Text key={paragraph} style={styles.heroCaption}>{paragraph}</Text>
        ))}
        <View style={styles.tagRow}>
          <Tag text={visual.mood} accent={visual.accent} />
          <Tag text={visual.line} accent={visual.accent} />
        </View>
        <View style={styles.heroButtonRow}>
          <PrimaryButton text="进入研习" onPress={() => navigateToStudyWithMaster(masterId)} />
        </View>
      </View>

      <View style={[styles.scrollColumns, isWide && styles.scrollColumnsWide]}>
        <View style={styles.columnMain}>
          <SectionHeading eyebrow="Axis" title="学术主轴" />
          <View style={styles.secondaryPanel}>
            {master.academicAxes.map((item) => (
              <Text key={item} style={styles.secondaryPanelText}>• {item}</Text>
            ))}
          </View>

          <SectionHeading eyebrow="Paper Digests" title="论文精髓" />
          <View style={[styles.dualGrid, isTablet && styles.dualGridWide]}>
            {master.paperDigests.map((item, index) => (
              <GuideCard key={`${master.id}-${index}`} step={`0${index + 1}`} title={`精髓 ${index + 1}`} text={item} />
            ))}
          </View>

          <SectionHeading eyebrow="Essence" title="学术主轴" />
          <View style={[styles.dualGrid, isTablet && styles.dualGridWide]}>
            {master.essence.map((item) => (
              <FeatureCard key={item.title} title={item.title} text={item.text} />
            ))}
          </View>

          <SectionHeading eyebrow="Learning Tip" title="学习提示" />
          <View style={styles.secondaryPanel}>
            <Text style={styles.secondaryPanelText}>{master.learningTip}</Text>
          </View>
        </View>

        <View style={styles.columnSide}>
          <SectionHeading eyebrow="Pathways" title="代表病门" />
          <View style={styles.secondaryPanel}>
            {master.signatureTopics.map((item) => (
              <Text key={item} style={styles.secondaryPanelText}>• {item}</Text>
            ))}
          </View>

          <SectionHeading eyebrow="Evidence" title="可继续回看的公开资料" />
          {renderEvidenceCards(master.sources)}
        </View>
      </View>
    </View>
  );
}

function StudyPage({
  isWide,
  studyMasterId,
  switchStudyMaster,
  currentStep,
  stepIndex,
  answers,
  errorText,
  goPrev,
  goNext,
  renderStudyStep,
  renderStudyResult,
}) {
  const master = masters[studyMasterId];
  const progress = Math.round(((stepIndex + 1) / studySteps.length) * 100);

  return (
    <View style={styles.pageStack}>
      <PageIntro
        eyebrow="研习入口"
        title="脑病研习入口"
        description="此页用于学术演练。请从缓急、病门、病势、主症与证素五个层次，逐步靠近某一条国医大师脑病路径。"
      />

      <View style={styles.secondaryPanel}>
        <Text style={styles.panelEyebrow}>学脉选择</Text>
        <Text style={styles.secondaryPanelTitle}>先定所宗之学脉</Text>
        <View style={styles.masterSwitchRow}>
          {orderedMasterIds.map((masterId) => {
            const active = masterId === studyMasterId;
            return (
              <Pressable
                key={masterId}
                style={[styles.masterSwitchCard, active && styles.masterSwitchCardActive]}
                onPress={() => switchStudyMaster(masterId)}
              >
                <Text style={[styles.masterSwitchName, active && styles.masterSwitchNameActive]}>{masters[masterId].name}</Text>
                <Text style={styles.masterSwitchDoctrine}>{masters[masterId].doctrine}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.secondaryPanelText}>当前研习对象：{master.name}</Text>
      </View>

      <View style={[styles.scrollColumns, isWide && styles.scrollColumnsWide]}>
        <View style={styles.columnMain}>
          <View style={styles.primaryPanel}>
            <Text style={styles.panelEyebrow}>研习次第</Text>
            <Text style={styles.primaryPanelTitle}>{currentStep.title}</Text>
            <Text style={styles.primaryPanelText}>{currentStep.subtitle}</Text>

            <View style={styles.progressRow}>
              <Text style={styles.progressText}>{stepIndex + 1} / {studySteps.length}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>

            <View style={styles.stepRail}>
              {studySteps.map((step, index) => {
                const active = index === stepIndex;
                return (
                  <View key={step.key} style={[styles.stepChip, active && styles.stepChipActive]}>
                    <Text style={[styles.stepChipText, active && styles.stepChipTextActive]}>{step.nav}</Text>
                  </View>
                );
              })}
            </View>

            {renderStudyStep()}

            {errorText ? (
              <View style={styles.warningCard}>
                <Text style={styles.warningText}>{errorText}</Text>
              </View>
            ) : null}

            <View style={styles.buttonRow}>
              <SecondaryButton text="上一步" onPress={goPrev} disabled={stepIndex === 0} />
              <PrimaryButton text={stepIndex === studySteps.length - 1 ? '生成学术路径' : '下一步'} onPress={goNext} />
            </View>
            <Text style={styles.inlineNote}>当前结果仅反映学习性病机归类，不构成临床处方建议。</Text>
          </View>
        </View>

        <View style={styles.columnSide}>{renderStudyResult()}</View>
      </View>
    </View>
  );
}

function MethodPage({ isWide }) {
  return (
    <View style={styles.pageStack}>
      <PageIntro
        eyebrow="研究方法"
        title="研究方法与资料边界"
        description="本站依据公开可核验资料，对三位国医大师脑病相关学术内容进行整理。"
      />

      <View style={styles.secondaryPanel}>
        <Text style={styles.secondaryPanelText}>所用资料主要包括官方机构页、官方转载医案、期刊官网摘要页、文献题录与目录线索。</Text>
        <Text style={styles.secondaryPanelText}>本站不诚称已完整通读中国知网中所有出现相关姓名的全文论文。原因在于全文访问受数据库权限与版权限制。因此，本站的学术结论属于“公开资料基础上的高频主轴提炼”，而非“封闭数据库全文穷尽式综述”。</Text>
        <Text style={styles.secondaryPanelText}>本站整理时遵循三项原则：其一，只提炼反复出现的病机主轴；其二，不以孤例代替通则；其三，公开原案只作学习展示，不直接转化为现实个体处方。</Text>
        <Text style={styles.secondaryPanelText}>本站定位为：学术传承、教学演练、研究浏览。</Text>
        <Text style={styles.secondaryPanelText}>本站不替代线下问诊、急诊评估及执业医师处方决策。若出现急性偏瘫、意识障碍、持续抽搐、爆炸样头痛等情况，应立即就医。</Text>
      </View>

      <View style={[styles.methodPreviewGrid, isWide && styles.methodPreviewGridWide]}>
        {researchCards.map((item) => (
          <MethodCard key={item.title} title={item.title} items={item.body} />
        ))}
      </View>

      <View style={styles.secondaryPanel}>
        <Text style={styles.secondaryPanelTitle}>研习次第</Text>
        {homeGuideCards.map((item) => (
          <View key={item.step} style={styles.pathwayListItem}>
            <Text style={styles.pathwayTitle}>{item.step} · {item.title}</Text>
            <Text style={styles.pathwayText}>{item.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.secondaryPanel}>
        <Text style={styles.secondaryPanelTitle}>版权说明</Text>
        <Text style={styles.secondaryPanelText}>{copyrightNotice}</Text>
      </View>

      <View style={styles.buttonRow}>
        <SecondaryButton text="查看隐私与支持" onPress={() => Linking.openURL(siteLinks.support)} />
      </View>
    </View>
  );
}

function NotFoundPage({ navigate }) {
  return (
    <View style={styles.pageStack}>
      <View style={styles.secondaryPanel}>
        <Text style={styles.secondaryPanelTitle}>未找到此卷</Text>
        <Text style={styles.secondaryPanelText}>当前路径不在站点结构内，已为你保留返回首页与进入研习入口。</Text>
        <View style={styles.buttonRow}>
          <SecondaryButton text="返回首页" onPress={() => navigate('/')} />
          <PrimaryButton text="继续研习" onPress={() => navigate('/study')} />
        </View>
      </View>
    </View>
  );
}

function SectionHeading({ eyebrow, title }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function PageIntro({ eyebrow, title, description }) {
  return (
    <View style={styles.pageIntro}>
      <Text style={styles.sectionEyebrow}>{eyebrow}</Text>
      <Text style={styles.pageTitle}>{title}</Text>
      <Text style={styles.pageDescription}>{description}</Text>
    </View>
  );
}

function PrimaryButton({ text, onPress }) {
  return (
    <Pressable style={styles.primaryButton} onPress={onPress}>
      <Text style={styles.primaryButtonText}>{text}</Text>
    </Pressable>
  );
}

function SecondaryButton({ text, onPress, disabled = false }) {
  return (
    <Pressable style={[styles.secondaryButton, disabled && styles.secondaryButtonDisabled]} onPress={onPress} disabled={disabled}>
      <Text style={[styles.secondaryButtonText, disabled && styles.secondaryButtonTextDisabled]}>{text}</Text>
    </Pressable>
  );
}

function Tag({ text, accent }) {
  return (
    <View style={[styles.tag, accent && { borderColor: accent }]}>
      <Text style={[styles.tagText, accent && { color: accent }]}>{text}</Text>
    </View>
  );
}

function FeatureCard({ title, text }) {
  return (
    <View style={styles.featureCard}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

function GuideCard({ step, title, text }) {
  return (
    <View style={styles.guideCard}>
      <Text style={styles.guideStep}>{step}</Text>
      <Text style={styles.guideTitle}>{title}</Text>
      <Text style={styles.guideText}>{text}</Text>
    </View>
  );
}

function MethodCard({ title, items }) {
  return (
    <View style={styles.methodCard}>
      <Text style={styles.methodCardTitle}>{title}</Text>
      {items.map((item) => (
        <Text key={item} style={styles.methodCardItem}>• {item}</Text>
      ))}
    </View>
  );
}

function MasterPreviewCard({ master, visual, onDetail }) {
  return (
    <View style={styles.masterPreviewCard}>
      <View style={[styles.masterAccentBar, { backgroundColor: visual.accent }]} />
      <Text style={styles.masterPreviewName}>{master.name}</Text>
      <Text style={styles.masterPreviewLabel}>{master.title}</Text>
      <Text style={styles.masterPreviewCore}>核心命题：{master.doctrine}</Text>
      <Text style={styles.masterPreviewText}>{visual.summary}</Text>
      <View style={styles.masterPreviewTagRow}>
        <Tag text={visual.mood} accent={visual.accent} />
        <Tag text={visual.line} accent={visual.accent} />
      </View>
      <View style={styles.buttonColumn}>
        <SecondaryButton text={`进入${master.name}学脉`} onPress={onDetail} />
      </View>
    </View>
  );
}

function DualColumnCard({ leftTitle, rightTitle, leftContent, rightContent }) {
  return (
    <View style={styles.dualColumnCard}>
      <View style={styles.dualColumnItem}>
        <Text style={styles.dualColumnTitle}>{leftTitle}</Text>
        {leftContent}
      </View>
      <View style={styles.dualColumnItem}>
        <Text style={styles.dualColumnTitle}>{rightTitle}</Text>
        {rightContent}
      </View>
    </View>
  );
}

function ChipGrid({ options, values, onPress }) {
  return (
    <View style={styles.chipGrid}>
      {options.map((item) => {
        const label = typeof item === 'string' ? item : item.label;
        const selected = values.includes(label);
        return (
          <Pressable key={label} style={[styles.choiceChip, selected && styles.choiceChipSelected]} onPress={() => onPress(label)}>
            <Text style={[styles.choiceChipText, selected && styles.choiceChipTextSelected]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SiteFooter({ navigate, openExternal }) {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerTitle}>站点入口</Text>
      <View style={styles.footerLinks}>
        <Pressable onPress={() => navigate('/')}><Text style={styles.footerLink}>首页</Text></Pressable>
        <Pressable onPress={() => navigate('/masters')}><Text style={styles.footerLink}>三家学脉</Text></Pressable>
        <Pressable onPress={() => navigate('/study')}><Text style={styles.footerLink}>研习入口</Text></Pressable>
        <Pressable onPress={() => navigate('/method')}><Text style={styles.footerLink}>研究方法</Text></Pressable>
        <Pressable onPress={() => openExternal(siteLinks.support)}><Text style={styles.footerLink}>隐私与支持</Text></Pressable>
        <Pressable onPress={() => openExternal(siteLinks.github)}><Text style={styles.footerLink}>GitHub Repository</Text></Pressable>
      </View>
      <Text style={styles.footerNote}>版权说明：原始论文、期刊页面、机构资料与公开转载医案等相关权利归原权利人所有，本站仅作学术传承、教学演练与研究浏览使用。</Text>
      <Text style={styles.footerNote}>如有版权异议、资料更正或下架请求，请联系 cn20230818@gmail.com。</Text>
    </View>
  );
}

const colors = {
  bg: '#0e0a08',
  bgRaised: '#17110d',
  card: '#1a1410',
  cardSoft: '#221912',
  cardLight: '#2a1f16',
  line: '#4b3828',
  gold: '#c99652',
  goldSoft: '#7d623b',
  ink: '#f2e3cc',
  inkSoft: '#c3b297',
  red: '#ac5945',
  jade: '#8aa08f',
  blue: '#6c8794',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  appShell: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: '#120d0a',
    gap: 14,
  },
  brandMark: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandSeal: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#2f1712',
    borderWidth: 1,
    borderColor: '#7a4331',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandSealText: {
    color: colors.red,
    fontSize: 20,
    fontWeight: '700',
  },
  brandCopy: {
    gap: 2,
  },
  brandTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  brandSubTitle: {
    color: colors.inkSoft,
    fontSize: 12,
  },
  navRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  navLink: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bgRaised,
  },
  navLinkActive: {
    backgroundColor: colors.cardLight,
    borderColor: colors.gold,
  },
  navLinkText: {
    color: colors.inkSoft,
    fontSize: 14,
    fontWeight: '600',
  },
  navLinkTextActive: {
    color: colors.ink,
  },
  pageScroll: {
    padding: 20,
    paddingBottom: 48,
    gap: 28,
  },
  pageScrollWide: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1320,
    paddingHorizontal: 28,
  },
  backdropLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 620,
    overflow: 'hidden',
  },
  mountainOne: {
    position: 'absolute',
    bottom: 280,
    left: -80,
    width: 320,
    height: 180,
    borderTopLeftRadius: 220,
    borderTopRightRadius: 220,
    backgroundColor: '#15100d',
    borderWidth: 1,
    borderColor: '#2b2119',
  },
  mountainTwo: {
    position: 'absolute',
    bottom: 240,
    left: 120,
    width: 420,
    height: 220,
    borderTopLeftRadius: 260,
    borderTopRightRadius: 260,
    backgroundColor: '#1b1410',
    borderWidth: 1,
    borderColor: '#34271c',
  },
  mountainThree: {
    position: 'absolute',
    bottom: 210,
    right: -90,
    width: 360,
    height: 190,
    borderTopLeftRadius: 220,
    borderTopRightRadius: 220,
    backgroundColor: '#231a14',
    borderWidth: 1,
    borderColor: '#403023',
  },
  cloudRibbonOne: {
    position: 'absolute',
    top: 58,
    right: 68,
    width: 220,
    height: 1,
    backgroundColor: '#6a512f',
    transform: [{ rotate: '-10deg' }],
  },
  cloudRibbonTwo: {
    position: 'absolute',
    top: 92,
    right: 28,
    width: 180,
    height: 1,
    backgroundColor: '#6a512f',
    transform: [{ rotate: '8deg' }],
  },
  pageStack: {
    gap: 26,
  },
  heroPanel: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 28,
    gap: 22,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.32,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
  },
  heroPanelWide: {
    padding: 34,
  },
  heroGrid: {
    gap: 20,
  },
  heroGridWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  heroMain: {
    flex: 1.2,
    gap: 14,
  },
  infoPlaque: {
    flex: 0.8,
    backgroundColor: colors.cardSoft,
    borderWidth: 1,
    borderColor: colors.goldSoft,
    padding: 22,
    borderRadius: 18,
    justifyContent: 'center',
    gap: 8,
    minHeight: 220,
  },
  plaqueEyebrow: {
    color: colors.gold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  plaqueTitle: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  plaqueLine: {
    color: colors.inkSoft,
    fontSize: 16,
    lineHeight: 24,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.ink,
    fontSize: 42,
    lineHeight: 50,
    fontWeight: '800',
  },
  heroLead: {
    color: colors.inkSoft,
    fontSize: 17,
    lineHeight: 29,
  },
  heroCaption: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 24,
  },
  heroButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  heroMottoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 18,
  },
  heroMotto: {
    color: colors.gold,
    fontSize: 14,
    letterSpacing: 1.2,
    fontWeight: '700',
  },
  primaryButton: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 999,
    backgroundColor: colors.gold,
  },
  primaryButtonText: {
    color: '#1a130d',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.cardSoft,
  },
  secondaryButtonDisabled: {
    opacity: 0.45,
  },
  secondaryButtonText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButtonTextDisabled: {
    color: colors.inkSoft,
  },
  sectionHeading: {
    gap: 4,
  },
  sectionEyebrow: {
    color: colors.gold,
    fontSize: 12,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '700',
  },
  sectionLead: {
    color: colors.inkSoft,
    fontSize: 15,
    lineHeight: 25,
    maxWidth: 980,
  },
  tripleGrid: {
    gap: 16,
  },
  tripleGridWide: {
    flexDirection: 'row',
  },
  featureCard: {
    flex: 1,
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    padding: 20,
    gap: 10,
  },
  featureTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '700',
  },
  featureText: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 24,
  },
  masterPreviewCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 24,
    padding: 22,
    gap: 12,
  },
  masterAccentBar: {
    width: 72,
    height: 3,
    borderRadius: 999,
  },
  masterPreviewName: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '700',
  },
  masterPreviewLabel: {
    color: colors.inkSoft,
    fontSize: 13,
  },
  masterPreviewCore: {
    color: colors.gold,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 24,
  },
  masterPreviewText: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 24,
  },
  masterPreviewTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.cardSoft,
  },
  tagText: {
    color: colors.inkSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  buttonColumn: {
    gap: 10,
    marginTop: 6,
  },
  methodPreviewGrid: {
    gap: 16,
  },
  methodPreviewGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  methodCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    padding: 18,
    gap: 8,
  },
  methodCardTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  methodCardItem: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 23,
  },
  centerRow: {
    alignItems: 'flex-start',
  },
  pageIntro: {
    gap: 8,
  },
  pageTitle: {
    color: colors.ink,
    fontSize: 38,
    fontWeight: '800',
  },
  pageDescription: {
    color: colors.inkSoft,
    fontSize: 15,
    lineHeight: 25,
    maxWidth: 940,
  },
  masterHero: {
    gap: 14,
  },
  masterSubTitle: {
    color: colors.inkSoft,
    fontSize: 16,
    lineHeight: 24,
  },
  masterHeroLead: {
    color: colors.gold,
  },
  scrollColumns: {
    gap: 18,
  },
  scrollColumnsWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  columnMain: {
    flex: 1.2,
    gap: 22,
  },
  columnSide: {
    flex: 0.8,
    gap: 22,
  },
  secondaryPanel: {
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 22,
    padding: 20,
    gap: 14,
  },
  primaryPanel: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.goldSoft,
    borderRadius: 24,
    padding: 22,
    gap: 16,
  },
  panelEyebrow: {
    color: colors.gold,
    fontSize: 12,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  primaryPanelTitle: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 38,
  },
  primaryPanelText: {
    color: colors.inkSoft,
    fontSize: 15,
    lineHeight: 25,
  },
  primaryPanelBullet: {
    color: colors.inkSoft,
    fontSize: 15,
    lineHeight: 25,
  },
  secondaryPanelTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '700',
  },
  secondaryPanelText: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 24,
  },
  dualGrid: {
    gap: 14,
  },
  dualGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  guideCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: colors.cardSoft,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    padding: 18,
    gap: 8,
  },
  guideStep: {
    color: colors.gold,
    fontSize: 12,
    letterSpacing: 1.8,
    fontWeight: '700',
  },
  guideTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  guideText: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 23,
  },
  pathwayListItem: {
    gap: 6,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  pathwayTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  pathwayText: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 22,
  },
  evidenceGrid: {
    gap: 12,
  },
  evidenceGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  evidenceCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: colors.cardSoft,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 16,
    gap: 8,
  },
  evidenceTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  evidenceTypeTag: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  evidenceUsageTag: {
    color: colors.jade,
    fontSize: 12,
    fontWeight: '700',
  },
  evidenceTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  evidenceNote: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 22,
  },
  evidenceLink: {
    color: colors.jade,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  masterSwitchRow: {
    gap: 12,
  },
  masterSwitchCard: {
    backgroundColor: colors.cardSoft,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  masterSwitchCardActive: {
    borderColor: colors.gold,
    backgroundColor: colors.cardLight,
  },
  masterSwitchName: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  masterSwitchNameActive: {
    color: colors.gold,
  },
  masterSwitchDoctrine: {
    color: colors.inkSoft,
    fontSize: 13,
    lineHeight: 21,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressText: {
    color: colors.inkSoft,
    fontSize: 13,
    width: 48,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#2b2016',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.gold,
  },
  stepRail: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stepChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.cardSoft,
  },
  stepChipActive: {
    borderColor: colors.gold,
    backgroundColor: '#322418',
  },
  stepChipText: {
    color: colors.inkSoft,
    fontSize: 13,
    fontWeight: '600',
  },
  stepChipTextActive: {
    color: colors.ink,
  },
  stepSection: {
    gap: 14,
  },
  sectionDescription: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 23,
  },
  inlineNote: {
    color: colors.inkSoft,
    fontSize: 13,
    lineHeight: 21,
  },
  optionCard: {
    backgroundColor: colors.cardSoft,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  optionCardSelected: {
    borderColor: colors.gold,
    backgroundColor: '#302317',
  },
  optionTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  optionMeta: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 22,
  },
  dualColumnCard: {
    gap: 12,
  },
  dualColumnItem: {
    backgroundColor: colors.cardSoft,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  dualColumnTitle: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '700',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  choiceChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#1c1611',
  },
  choiceChipSelected: {
    borderColor: colors.gold,
    backgroundColor: '#342417',
  },
  choiceChipText: {
    color: colors.inkSoft,
    fontSize: 14,
  },
  choiceChipTextSelected: {
    color: colors.ink,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  resultStack: {
    gap: 18,
  },
  reasonCard: {
    backgroundColor: colors.cardSoft,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 16,
    gap: 6,
  },
  reasonTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  reasonText: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 22,
  },
  warningCard: {
    backgroundColor: '#2a1b13',
    borderWidth: 1,
    borderColor: colors.goldSoft,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  warningText: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 22,
  },
  formulaGrid: {
    gap: 10,
  },
  formulaGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  formulaItem: {
    minWidth: 180,
    flexGrow: 1,
    backgroundColor: colors.cardSoft,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  formulaName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  formulaDose: {
    color: colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    marginTop: 16,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    gap: 10,
  },
  footerTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  footerNote: {
    color: colors.inkSoft,
    fontSize: 13,
    lineHeight: 22,
    maxWidth: 980,
  },
  footerLink: {
    color: colors.jade,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default App;
