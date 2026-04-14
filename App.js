import { useState } from 'react';
import {
  Linking,
  Modal,
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
import { computeResult, createAnswers, getAvailableModules, getStepOptions, toggleMultiValue, validateStep } from './src/lib/engine';

const steps = [
  { key: 'module', label: '选病种' },
  { key: 'phase', label: '选病期' },
  { key: 'signs', label: '选症状' },
  { key: 'constitutions', label: '选证素' },
  { key: 'redflags', label: '急重风险' },
];

const siteLinks = {
  website: 'https://cn20230818-netizen.github.io/guoyi-master-study/',
  privacy: 'https://cn20230818-netizen.github.io/guoyi-master-study/privacy-policy.html',
  support: 'https://cn20230818-netizen.github.io/guoyi-master-study/support.html',
  github: 'https://github.com/cn20230818-netizen/guoyi-master-study',
};

function masterAnswerState(masterId) {
  const master = masters[masterId];
  const firstModule = getAvailableModules(master)[0] || null;
  return createAnswers(firstModule);
}

function App() {
  const { width } = useWindowDimensions();
  const [activeMasterId, setActiveMasterId] = useState('zhang');
  const [answers, setAnswers] = useState(masterAnswerState('zhang'));
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [errorText, setErrorText] = useState('');
  const [sourcesVisible, setSourcesVisible] = useState(false);
  const [policyVisible, setPolicyVisible] = useState(false);
  const [formulaExpanded, setFormulaExpanded] = useState(false);

  const master = masters[activeMasterId];
  const step = steps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);
  const availableModules = getAvailableModules(master);
  const selectedModule = answers.module ? moduleMeta[answers.module] : null;
  const isWide = width >= 960;
  const isTablet = width >= 720;

  const switchMaster = (masterId) => {
    setActiveMasterId(masterId);
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
        next.redflags = [];
      }

      return next;
    });
    setResult(null);
    setErrorText('');
    setFormulaExpanded(false);
  };

  const updateMultiValue = (key, value) => {
    setAnswers((current) => ({
      ...current,
      [key]: toggleMultiValue(current[key], value),
    }));
    setResult(null);
    setErrorText('');
    setFormulaExpanded(false);
  };

  const goNext = () => {
    const nextError = validateStep(step.key, answers);

    if (nextError) {
      setErrorText(nextError);
      return;
    }

    if (stepIndex < steps.length - 1) {
      setStepIndex((current) => current + 1);
      setErrorText('');
      return;
    }

    setResult(computeResult(master, answers));
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

  const openUrl = async (url) => {
    await Linking.openURL(url);
  };

  const renderStepBody = () => {
    if (step.key === 'module') {
      const options = getStepOptions(step.key, answers, master);
      return (
        <View style={styles.optionColumn}>
          <TipCard text="先决定你要演练的脑病入口。这个选择会决定后续病期、症状和结果页的文献原案。" />
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

    if (step.key === 'phase' && selectedModule) {
      const options = getStepOptions(step.key, answers, master);
      return (
        <View style={styles.optionColumn}>
          <TipCard text={`当前路径：${selectedModule.label}。先标记病期，它会直接影响先祛邪还是先扶正的比例。`} />
          {options.map((option) => (
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

    if (step.key === 'signs' && selectedModule) {
      const options = getStepOptions(step.key, answers, master);
      return (
        <View style={styles.optionColumn}>
          <TipCard text="可多选 1-4 个最关键症状。不要把所有表现都塞进去，只抓最能决定治法的线索。" />
          <ChipGrid
            options={options}
            values={answers.signs}
            onPress={(value) => updateMultiValue('signs', value)}
          />
        </View>
      );
    }

    if (step.key === 'constitutions' && selectedModule) {
      const options = getStepOptions(step.key, answers, master);
      return (
        <View style={styles.optionColumn}>
          <TipCard text="这里选的是底层证素，而不是表面症状。脑病学习最容易漏掉的，恰恰是气虚、阳虚、肾精不足等本虚因素。" />
          <ChipGrid
            options={options}
            values={answers.constitutions}
            onPress={(value) => updateMultiValue('constitutions', value)}
          />
        </View>
      );
    }

    return (
      <View style={styles.optionColumn}>
        <TipCard text="若存在以下任一项，应先急诊评估。原型会停止显示学习方路，改成急重分流提醒。" />
        <ChipGrid
          options={commonRedflags}
          values={answers.redflags}
          onPress={(value) => updateMultiValue('redflags', value)}
        />
      </View>
    );
  };

  const renderFormula = (formula) => {
    const isCase = formula.kind === 'case';

    return (
      <View style={styles.blockCard}>
        <Text style={styles.blockTitle}>{formula.title}</Text>
        <Text style={styles.blockText}>
          {isCase
            ? '默认只展示“这是公开文献原案，不能直接下发”。如需学习原案构成，可手动展开。'
            : formula.caution}
        </Text>
        {isCase ? <Text style={styles.blockText}>{formula.caution}</Text> : null}

        {isCase ? (
          <Pressable style={styles.inlineButton} onPress={() => setFormulaExpanded((current) => !current)}>
            <Text style={styles.inlineButtonText}>
              {formulaExpanded ? '收起原案药味、克数与服法' : '展开原案药味、克数与服法'}
            </Text>
          </Pressable>
        ) : null}

        {(!isCase || formulaExpanded) && (
          <>
            <View style={styles.formulaGrid}>
              {formula.herbs.map(([name, dose]) => (
                <View key={`${formula.title}-${name}`} style={styles.formulaItem}>
                  <Text style={styles.formulaName}>{name}</Text>
                  <Text style={styles.formulaDose}>{dose}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.blockText}>{formula.usage}</Text>
          </>
        )}
      </View>
    );
  };

  const renderResult = () => {
    if (!result) {
      return (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderText}>完成上方五步后，这里会出现最匹配的学术路径、方路层和文献原案入口。</Text>
        </View>
      );
    }

    if (result.type === 'emergency') {
      return (
        <View style={styles.panel}>
          <View style={styles.resultHeader}>
            <View>
              <Text style={styles.pill}>急重分流</Text>
              <Text style={styles.resultTitle}>{result.title}</Text>
            </View>
          </View>
          <Text style={styles.resultNarrative}>{result.narrative}</Text>
          <View style={styles.badgeWrap}>
            {answers.redflags.map((item) => (
              <View key={item} style={styles.badge}>
                <Text style={styles.badgeText}>{item}</Text>
              </View>
            ))}
          </View>
          <BlockCard title="立即动作" items={result.actions} />
          <View style={styles.blockCard}>
            <Text style={styles.blockTitle}>参考来源</Text>
            {result.evidence.map((item) => (
              <Pressable key={item.url} onPress={() => openUrl(item.url)}>
                <Text style={styles.linkText}>{item.title}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      );
    }

    const best = result.best;
    const alternative = result.alternative;
    const matchedSigns = best.signs.filter((item) => answers.signs.includes(item));
    const matchedConstitutions = best.constitutions.filter((item) => answers.constitutions.includes(item));
    const phaseLabel = selectedModule?.phases.find((item) => item.id === answers.phase)?.label || '未选';

    return (
      <View style={styles.panel}>
        <View style={styles.resultHeader}>
          <View>
            <Text style={styles.pill}>{master.name}</Text>
            <Text style={styles.resultTitle}>{best.label}</Text>
          </View>
        </View>
        <Text style={styles.resultNarrative}>{best.narrative}</Text>
        <View style={styles.badgeWrap}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{selectedModule?.label}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{best.therapeutic}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{phaseLabel}</Text>
          </View>
        </View>

        <View style={styles.blockCard}>
          <Text style={styles.blockTitle}>辨证画像</Text>
          <Text style={styles.blockText}>当前病期：{phaseLabel}</Text>
          <Text style={styles.blockText}>
            命中的关键症状：{matchedSigns.length ? matchedSigns.join('、') : '以主病路径推断'}
          </Text>
          <Text style={styles.blockText}>
            命中的底层证素：{matchedConstitutions.length ? matchedConstitutions.join('、') : '建议继续完善四诊资料'}
          </Text>
          <Text style={styles.blockText}>对应治法：{best.therapeutic}</Text>
        </View>

        <View style={styles.blockCard}>
          <Text style={styles.blockTitle}>为什么匹配到这一路</Text>
          <Text style={styles.blockText}>
            你的输入更接近这位大师在该病种中的主轴病机。这里不是单看一个症状，而是病期、证素与病机方向一起决定结果。
          </Text>
        </View>

        {renderFormula(best.formula)}

        {alternative ? (
          <View style={styles.blockCard}>
            <Text style={styles.blockTitle}>备选路径</Text>
            <Text style={styles.blockText}>
              如果后续补充了寒热、舌苔、二便、情志、既往史，可以再对比 {alternative.label}。
            </Text>
          </View>
        ) : null}

        <View style={styles.blockCard}>
          <Text style={styles.blockTitle}>证据来源</Text>
          {master.sources.map((item) => (
            <Pressable key={item.url} onPress={() => openUrl(item.url)}>
              <Text style={styles.linkText}>{item.title}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, isWide && styles.scrollContentWide]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, isWide && styles.heroWide]}>
          <View style={[styles.heroTopRow, isWide && styles.heroTopRowWide]}>
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>文献驱动 · 移动端学习版</Text>
              <Text style={styles.heroTitle}>国医大师脑病学脉研习</Text>
              <Text style={styles.heroLead}>
                将张学文、刘祖贻、凃晋文三位大师的公开可核验学术思想，整理成一个可在手机上逐步演练的学习型应用。
              </Text>
              <View style={styles.heroActionRow}>
                <Pressable style={styles.primaryHeroButton} onPress={() => openUrl(siteLinks.website)}>
                  <Text style={styles.primaryHeroButtonText}>正式站点</Text>
                </Pressable>
                <Pressable style={styles.ghostHeroButton} onPress={() => openUrl(siteLinks.github)}>
                  <Text style={styles.ghostHeroButtonText}>GitHub</Text>
                </Pressable>
                <Pressable style={styles.ghostHeroButton} onPress={() => openUrl(siteLinks.privacy)}>
                  <Text style={styles.ghostHeroButtonText}>隐私政策</Text>
                </Pressable>
              </View>
            </View>
            <View style={[styles.heroAside, isWide && styles.heroAsideWide]}>
              <View style={styles.seal}>
                <Text style={styles.sealText}>研习</Text>
              </View>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>3 位</Text>
                <Text style={styles.heroStatLabel}>国医大师</Text>
              </View>
              <View style={styles.heroStatCard}>
                <Text style={styles.heroStatValue}>5 步</Text>
                <Text style={styles.heroStatLabel}>辨证引导</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroChipRow}>
            <BadgeText text="脑当为脏" />
            <BadgeText text="六辨七治" />
            <BadgeText text="痰瘀热风同参" />
          </View>

          <View style={[styles.noticeCard, isWide && styles.noticeCardWide]}>
            <Text style={styles.noticeTitle}>使用边界</Text>
            <Text style={styles.noticeText}>本应用用于学习辨证思路与文献原案，不替代线下问诊、处方决策或急诊处置。</Text>
          </View>
        </View>

        <View style={[styles.overviewGrid, isWide && styles.overviewGridWide]}>
          <FeatureCard
            title="大师学脉"
            text="首页可在张学文、刘祖贻、凃晋文三位大师之间切换，先抓主张，再进入病机路径。"
          />
          <FeatureCard
            title="五步演练"
            text="从病种、病期、症状、证素到急重风险，逐步缩小辨证范围，避免一上来就盯死单一症状。"
          />
          <FeatureCard
            title="结果可追溯"
            text="结果页同时展示辨证画像、学习方路和公开文献线索，方便回到原始资料继续深学。"
          />
        </View>

        <View style={[styles.panel, isWide && styles.panelWide]}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>How To Use</Text>
              <Text style={styles.panelTitle}>怎么使用这个网站</Text>
            </View>
          </View>
          <View style={[styles.guideGrid, isTablet && styles.guideGridWide]}>
            <GuideCard
              step="01"
              title="先选大师"
              text="如果你想学脑病整体框架，先看张学文；想学恢复期拆解，看刘祖贻；想看急慢杂病兼顾，可看凃晋文。"
            />
            <GuideCard
              step="02"
              title="再选主病与病期"
              text="优先判断中风、痫证、眩晕、失眠等入口，再分急性、恢复、久病等阶段。"
            />
            <GuideCard
              step="03"
              title="抓关键线索"
              text="只选最能决定病机方向的几个症状和证素，不要把所有表现一股脑都选满。"
            />
            <GuideCard
              step="04"
              title="看学习输出"
              text="结果会给出匹配路径、治法主轴、学习方路和参考文献，适合教学与继续查阅。"
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEyebrow}>Step 1</Text>
          <Text style={styles.sectionTitle}>选择国医大师</Text>
        </View>

        {isWide ? (
          <View style={styles.masterGrid}>
            {orderedMasterIds.map((masterId) => {
              const item = masters[masterId];
              const active = masterId === activeMasterId;
              return (
                <Pressable
                  key={masterId}
                  style={[styles.masterCard, styles.masterCardGrid, active && styles.masterCardActive]}
                  onPress={() => switchMaster(masterId)}
                >
                  <Text style={styles.masterName}>{item.name}</Text>
                  <Text style={styles.masterSubtitle}>{item.title}</Text>
                  <Text style={styles.masterQuote}>{item.quote}</Text>
                  <Text style={styles.masterDoctrine}>{item.doctrine}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.masterRow}>
            {orderedMasterIds.map((masterId) => {
              const item = masters[masterId];
              const active = masterId === activeMasterId;
              return (
                <Pressable
                  key={masterId}
                  style={[styles.masterCard, active && styles.masterCardActive]}
                  onPress={() => switchMaster(masterId)}
                >
                  <Text style={styles.masterName}>{item.name}</Text>
                  <Text style={styles.masterSubtitle}>{item.title}</Text>
                  <Text style={styles.masterQuote}>{item.quote}</Text>
                  <Text style={styles.masterDoctrine}>{item.doctrine}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <View style={[styles.panel, isWide && styles.panelWide]}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>Study Notes</Text>
              <Text style={styles.panelTitle}>{master.name}</Text>
              <Text style={styles.panelSubTitle}>{master.doctrine}</Text>
            </View>
            <Pressable style={styles.inlineButton} onPress={() => setSourcesVisible(true)}>
              <Text style={styles.inlineButtonText}>文献线索</Text>
            </Pressable>
          </View>

          <Text style={styles.panelIntro}>{master.intro}</Text>

          {master.essence.map((item) => (
            <View key={item.title} style={styles.noteCard}>
              <Text style={styles.noteTitle}>{item.title}</Text>
              <Text style={styles.noteText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEyebrow}>Step 2</Text>
          <Text style={styles.sectionTitle}>逐步辨证引导</Text>
        </View>

        <View style={[styles.panel, isWide && styles.panelWide]}>
          <View style={styles.progressRow}>
            <Text style={styles.progressText}>{stepIndex + 1} / {steps.length}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepChipRow}>
            {steps.map((item, index) => (
              <View key={item.key} style={[styles.stepChip, index === stepIndex && styles.stepChipActive]}>
                <Text style={[styles.stepChipText, index === stepIndex && styles.stepChipTextActive]}>{item.label}</Text>
              </View>
            ))}
          </ScrollView>

          <Text style={styles.stepTitle}>{step.label}</Text>
          {renderStepBody()}

          {errorText ? <TipCard tone="warning" text={errorText} /> : null}

          <View style={styles.actionRow}>
            <Pressable style={[styles.actionButton, styles.secondaryAction]} onPress={goPrev} disabled={stepIndex === 0}>
              <Text style={styles.secondaryActionText}>上一步</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={goNext}>
              <Text style={styles.actionButtonText}>{stepIndex === steps.length - 1 ? '生成学习画像' : '下一步'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEyebrow}>Step 3</Text>
          <Text style={styles.sectionTitle}>学习输出</Text>
        </View>
        {renderResult()}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEyebrow}>Compliance</Text>
          <Text style={styles.sectionTitle}>隐私与上架准备</Text>
        </View>

        <View style={[styles.panel, isWide && styles.panelWide]}>
          <View style={styles.blockCard}>
            <Text style={styles.blockTitle}>当前应用内隐私承诺</Text>
            <Text style={styles.blockText}>当前版本不创建账号，不上传病例，不做云端诊断，所有交互仅在本地设备内完成。</Text>
            <Text style={styles.blockText}>任何公开医案剂量都只作为学习材料展示，不能直接下发给患者。</Text>
          </View>

          <View style={styles.blockCard}>
            <Text style={styles.blockTitle}>真正上架前还要补齐</Text>
            <Text style={styles.blockText}>1. 真实隐私政策 URL 与支持联系方式。</Text>
            <Text style={styles.blockText}>2. 应用图标、启动图、商店截图和审核演示视频。</Text>
            <Text style={styles.blockText}>3. 若进入临床辅助决策场景，还要补医师复核、禁忌症和转诊模块。</Text>
          </View>

          <Pressable style={styles.inlineButton} onPress={() => setPolicyVisible(true)}>
            <Text style={styles.inlineButtonText}>查看内置隐私与审核说明</Text>
          </Pressable>
        </View>

        <View style={[styles.footerCard, isWide && styles.panelWide]}>
          <Text style={styles.footerTitle}>公开链接</Text>
          <View style={styles.footerLinkRow}>
            <Pressable style={styles.footerLink} onPress={() => openUrl(siteLinks.website)}>
              <Text style={styles.footerLinkText}>主页</Text>
            </Pressable>
            <Pressable style={styles.footerLink} onPress={() => openUrl(siteLinks.support)}>
              <Text style={styles.footerLinkText}>支持页</Text>
            </Pressable>
            <Pressable style={styles.footerLink} onPress={() => openUrl(siteLinks.privacy)}>
              <Text style={styles.footerLinkText}>隐私政策</Text>
            </Pressable>
            <Pressable style={styles.footerLink} onPress={() => openUrl(siteLinks.github)}>
              <Text style={styles.footerLinkText}>源码仓库</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal visible={sourcesVisible} animationType="slide" onRequestClose={() => setSourcesVisible(false)}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>Evidence</Text>
              <Text style={styles.modalTitle}>{master.name} · 文献线索</Text>
            </View>
            <Pressable style={styles.inlineButton} onPress={() => setSourcesVisible(false)}>
              <Text style={styles.inlineButtonText}>关闭</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {master.sources.map((item) => (
              <View key={item.url} style={styles.sourceCard}>
                <Pressable onPress={() => openUrl(item.url)}>
                  <Text style={styles.linkText}>{item.title}</Text>
                </Pressable>
                <Text style={styles.noteText}>{item.note}</Text>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={policyVisible} animationType="slide" onRequestClose={() => setPolicyVisible(false)}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>Policy</Text>
              <Text style={styles.modalTitle}>隐私与审核说明</Text>
            </View>
            <Pressable style={styles.inlineButton} onPress={() => setPolicyVisible(false)}>
              <Text style={styles.inlineButtonText}>关闭</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.sourceCard}>
              <Text style={styles.noteTitle}>隐私摘要</Text>
              <Text style={styles.noteText}>当前版本不收集账号信息、不上传问答内容、不集成广告 SDK、不做个性化追踪。</Text>
              <Text style={styles.noteText}>如果未来接入云端病例、用户账号或分析 SDK，必须同步更新隐私政策与商店申报。</Text>
            </View>
            <View style={styles.sourceCard}>
              <Text style={styles.noteTitle}>审核定位</Text>
              <Text style={styles.noteText}>建议在商店文案里把产品定位为中医文献学习与辨证教学辅助，而不是患者自助诊疗工具。</Text>
              <Text style={styles.noteText}>若继续往自动开方方向扩展，苹果和 Google 的健康医疗审核风险都会明显上升。</Text>
            </View>
            <View style={styles.sourceCard}>
              <Text style={styles.noteTitle}>发布阻塞项</Text>
              <Text style={styles.noteText}>iOS 侧仍缺完整 Xcode、Apple Developer 账号、签名证书和 App Store Connect 元数据。</Text>
              <Text style={styles.noteText}>Android 侧仍缺 Google Play 开发者账号、正式图标、截图、隐私政策 URL 和最终包名确认。</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function TipCard({ text, tone = 'default' }) {
  return (
    <View style={[styles.tipCard, tone === 'warning' && styles.tipCardWarning]}>
      <Text style={styles.tipText}>{text}</Text>
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

function BadgeText({ text }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{text}</Text>
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

function BlockCard({ title, items }) {
  return (
    <View style={styles.blockCard}>
      <Text style={styles.blockTitle}>{title}</Text>
      {items.map((item) => (
        <Text key={item} style={styles.blockText}>• {item}</Text>
      ))}
    </View>
  );
}

const colors = {
  bg: '#efe4cf',
  paper: '#fbf6eb',
  paperDeep: '#f4ecd8',
  ink: '#2f2923',
  inkSoft: '#65584a',
  line: '#d8c7a7',
  gold: '#8d6831',
  goldSoft: '#efe2c9',
  red: '#8b3a2d',
  jade: '#476a5d',
  warning: '#f7e7cf',
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 28,
    gap: 14,
  },
  scrollContentWide: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1240,
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  hero: {
    backgroundColor: colors.paper,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    gap: 14,
  },
  heroWide: {
    padding: 24,
    gap: 18,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroTopRowWide: {
    gap: 24,
  },
  heroCopy: {
    flex: 1,
    gap: 10,
  },
  heroAside: {
    gap: 10,
    alignItems: 'flex-end',
  },
  heroAsideWide: {
    minWidth: 184,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.ink,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
  },
  heroLead: {
    color: colors.inkSoft,
    fontSize: 15,
    lineHeight: 24,
  },
  heroActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 2,
  },
  primaryHeroButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.gold,
  },
  primaryHeroButtonText: {
    color: '#fffdf8',
    fontSize: 14,
    fontWeight: '700',
  },
  ghostHeroButton: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#fff8ee',
  },
  ghostHeroButtonText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '600',
  },
  seal: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#f4dfdc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d9a7a0',
    transform: [{ rotate: '-8deg' }],
  },
  sealText: {
    color: colors.red,
    fontSize: 22,
    fontWeight: '700',
  },
  heroStatCard: {
    minWidth: 112,
    borderRadius: 18,
    backgroundColor: colors.paperDeep,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  heroStatValue: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '700',
  },
  heroStatLabel: {
    color: colors.inkSoft,
    fontSize: 13,
  },
  heroChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noticeCard: {
    borderRadius: 18,
    backgroundColor: colors.paperDeep,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8,
  },
  noticeCardWide: {
    padding: 16,
  },
  noticeTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  noticeText: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 22,
  },
  sectionHeader: {
    gap: 4,
    marginTop: 6,
  },
  overviewGrid: {
    gap: 12,
  },
  overviewGridWide: {
    flexDirection: 'row',
  },
  featureCard: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: '#f8f1e2',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    gap: 8,
  },
  featureTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  featureText: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 22,
  },
  sectionEyebrow: {
    color: colors.gold,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '700',
  },
  masterRow: {
    gap: 12,
    paddingRight: 8,
  },
  masterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  masterCard: {
    width: 240,
    backgroundColor: colors.paper,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 10,
  },
  masterCardGrid: {
    width: '31.5%',
    minWidth: 260,
    flexGrow: 1,
  },
  masterCardActive: {
    borderColor: colors.gold,
    backgroundColor: '#fff9ef',
  },
  masterName: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '700',
  },
  masterSubtitle: {
    color: colors.inkSoft,
    fontSize: 13,
  },
  masterQuote: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 22,
  },
  masterDoctrine: {
    color: colors.gold,
    fontSize: 13,
    lineHeight: 20,
  },
  panel: {
    backgroundColor: colors.paper,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 14,
  },
  panelWide: {
    padding: 22,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  panelTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '700',
  },
  panelSubTitle: {
    color: colors.inkSoft,
    fontSize: 13,
    marginTop: 2,
  },
  panelIntro: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 23,
  },
  noteCard: {
    borderRadius: 18,
    backgroundColor: colors.paperDeep,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 6,
  },
  noteTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  noteText: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 22,
  },
  guideGrid: {
    gap: 12,
  },
  guideGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  guideCard: {
    flex: 1,
    minWidth: 220,
    borderRadius: 22,
    backgroundColor: '#fffaf1',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 8,
  },
  guideStep: {
    color: colors.gold,
    fontSize: 12,
    letterSpacing: 1.6,
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
    lineHeight: 22,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressText: {
    width: 44,
    color: colors.inkSoft,
    fontSize: 13,
  },
  progressTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.goldSoft,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.gold,
  },
  stepChipRow: {
    gap: 8,
  },
  stepChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#f8f1e2',
  },
  stepChipActive: {
    borderColor: colors.gold,
    backgroundColor: colors.goldSoft,
  },
  stepChipText: {
    color: colors.inkSoft,
    fontSize: 13,
  },
  stepChipTextActive: {
    color: colors.ink,
    fontWeight: '700',
  },
  stepTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '700',
  },
  optionColumn: {
    gap: 10,
  },
  optionCard: {
    borderRadius: 18,
    backgroundColor: '#fffaf1',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    gap: 6,
  },
  optionCardSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.goldSoft,
  },
  optionTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  optionMeta: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 21,
  },
  tipCard: {
    borderRadius: 16,
    backgroundColor: '#f8eed9',
    borderWidth: 1,
    borderColor: colors.line,
    padding: 13,
  },
  tipCardWarning: {
    backgroundColor: colors.warning,
    borderColor: '#d7af79',
  },
  tipText: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 21,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  choiceChip: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#fffaf1',
  },
  choiceChipSelected: {
    backgroundColor: colors.goldSoft,
    borderColor: colors.gold,
  },
  choiceChipText: {
    color: colors.inkSoft,
    fontSize: 14,
  },
  choiceChipTextSelected: {
    color: colors.ink,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.gold,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryAction: {
    backgroundColor: '#f7f0e1',
    borderWidth: 1,
    borderColor: colors.line,
  },
  actionButtonText: {
    color: '#fffdf8',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryActionText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  placeholderCard: {
    borderRadius: 24,
    backgroundColor: '#f7f0e1',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.line,
    padding: 18,
  },
  placeholderText: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 22,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pill: {
    alignSelf: 'flex-start',
    color: colors.gold,
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '700',
  },
  resultTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  resultNarrative: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 23,
  },
  badgeWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#fffaf1',
  },
  badgeText: {
    color: colors.inkSoft,
    fontSize: 13,
  },
  blockCard: {
    borderRadius: 18,
    backgroundColor: colors.paperDeep,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    gap: 8,
  },
  footerCard: {
    borderRadius: 24,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    gap: 12,
  },
  footerTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  footerLinkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  footerLink: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#fffaf1',
  },
  footerLinkText: {
    color: colors.jade,
    fontSize: 14,
    fontWeight: '700',
  },
  blockTitle: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '700',
  },
  blockText: {
    color: colors.inkSoft,
    fontSize: 14,
    lineHeight: 22,
  },
  inlineButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#fffaf1',
  },
  inlineButtonText: {
    color: colors.jade,
    fontSize: 13,
    fontWeight: '700',
  },
  formulaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  formulaItem: {
    width: '48%',
    backgroundColor: '#fff9ef',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
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
  },
  linkText: {
    color: colors.jade,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    alignItems: 'flex-start',
  },
  modalTitle: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: '700',
  },
  modalContent: {
    padding: 16,
    gap: 12,
  },
  sourceCard: {
    borderRadius: 20,
    backgroundColor: colors.paper,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8,
  },
});

export default App;
