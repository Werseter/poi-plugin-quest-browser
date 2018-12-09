import { connect } from 'react-redux'
import { classNames } from 'classnames'
import React, { Component } from 'react'
import { PropTypes } from 'prop-types'
import { Panel, Button, ButtonGroup, ButtonToolbar,
         OverlayTrigger, Tooltip, Label } from 'react-bootstrap'
import { get, memoize, times, partial } from 'lodash'
import { join } from 'path-extra'

import { reducer, loadTranslations } from './redux'
import { questTypeTabNames, navigationArrows,
         questTypeIcons, apiQuestTypeTabIds } from './constants'
import { settingsClass } from './settings'

import { extensionSelectorFactory } from 'views/utils/selectors'
import { layoutResizeObserver } from 'views/services/layout'

import { sumSubgoals, getStyleByProgress, getStyleByPercent,
         progressLabelText, getToolTip, getStyleByCompletion,
         completionLabelText } from './task-progress-wrapper'
 
const { dispatch, ipc } = window

import i18next from 'views/env-parts/i18next'

const store = extensionSelectorFactory('poi-plugin-quest-browser');

const TranslationBundler = (questId, state, props) => {
  if(!questId)
    return null;
  const { lngWikiId, lngQuestTitles, lngQuestDescriptions } = props;
  const translationBank = get(store(state), 'translationBank');
  return ({
    wiki_id : get(translationBank[lngWikiId][questId], 'wiki_id'),
    api_title : get(translationBank[lngQuestTitles][questId], 'api_title'),
    api_detail : get(translationBank[lngQuestDescriptions][questId], 'api_detail'),
  })
}

const NavigationButton = connect(
  (state, {activePageTabId}) => memoize((state) => activePageTabId)
)(({activePageTabId, onClick, navId, disabled}) => 
  <Button
    bsStyle={'default'}
    onClick={onClick}
    disabled={disabled}
  >
    {navigationArrows[navId]}
  </Button>
)
                    
const QuestTypeSwitchButton = connect(
  (state, {activeTypeTabId}) => memoize((state) => activeTypeTabId)
)(({questTypeTabId, activeTypeTabId, onClick}) => 
  <Button
    bsStyle={'success'}
    onClick={onClick}
    className={questTypeTabId == activeTypeTabId ? 'active' : ''}
  >
    {i18next.t('poi-plugin-quest-browser:' + questTypeTabNames[questTypeTabId])}
  </Button>
)

const QuestPageSwitchButton = connect(
  (state, {activePageTabId}) => memoize((state) => activePageTabId)
)(({questPageTabId, activePageTabId, onClick, currMaxPages}) => 
  <Button
    bsStyle={questPageTabId < currMaxPages ? 'success' : 'default'}
    disabled={questPageTabId >= currMaxPages}
    onClick={onClick}
    className={questPageTabId == activePageTabId ? 'active' : ''}
  >
    {questPageTabId + 1}
  </Button>
)

const Quest = (props) => {
  if(!props.questData)
    return null;
  const [count, required] = sumSubgoals(props.questRecord);
  const progressStyle = props.questRecord ? getStyleByPercent(count / required) :
                                              getStyleByProgress(props.questData)
  const progressLabel = props.questRecord ? `${count} / ${required}` :
                                            progressLabelText(props.questData)
  const progressOverlay = props.questRecord ? <div>{getToolTip(props.questRecord || {})}</div> :
                                              undefined
  const completionStyle = getStyleByCompletion(props.questData)
  const completionLabel = completionLabelText(props.questData)
  const contents = (
    <span>
     {props.useTranslations && props.translation && props.translation.wiki_id ? `${props.translation.wiki_id} - ` : ''}
     {props.useTranslations && props.translation && props.translation.api_title ? props.translation.api_title : props.questData.api_title}<br/>
     {props.useTranslations && props.translation && props.translation.api_detail ? props.translation.api_detail : props.questData.api_detail.replace(/<br\s*\/?>/gi, '')}
    </span>
  )
  return (
    <div className="quest-item" onClick={props.onClick}>
      <div className="quest-type-info">
        <div>
          <Label bsStyle={completionStyle}>{completionLabel}</Label>
        </div>
        <img src={questTypeIcons[props.questData.api_category - 1]}/>
        <div>
          <OverlayTrigger
            placement='top'
            overlay={
              <Tooltip id={`task-progress-${props.questData.api_no}`} style={progressOverlay ? null : {display: 'none'}}>{progressOverlay}</Tooltip>
            }
          >
            <Label bsStyle={progressStyle}>{progressLabel}</Label>
          </OverlayTrigger>
        </div>
      </div>
      <div className="quest-box">
        <OverlayTrigger
            placement='bottom'
            overlay={
              <Tooltip id={`quest-id-${props.questData.api_no}`} style={contents ? null : {display: 'none'}}>{contents}</Tooltip>
            }
        >
          <div className="quest-contents">
            {contents}
          </div>
        </OverlayTrigger>
        <div className="quest-resource-img">
          <div className="quest-resource-img-wrapper">
            <img src="assets/img/material/01.png"/>{props.questData.api_get_material[0]}
          </div>
          <div className="quest-resource-img-wrapper">
            <img src="assets/img/material/02.png"/>{props.questData.api_get_material[1]}
          </div>
          <div className="quest-resource-img-wrapper">
            <img src="assets/img/material/03.png"/>{props.questData.api_get_material[2]}
          </div>
          <div className="quest-resource-img-wrapper">
            <img src="assets/img/material/04.png"/>{props.questData.api_get_material[3]}
          </div>
        </div>
      </div>
    </div>
  )
}
const QuestPanel = connect(
  (state, {activePageTabId, activeTypeTabId, handlePluginSwitch,
           lngWikiId, lngQuestTitles, lngQuestDescriptions }) => ({
    activePageTabId,
    activeTypeTabId,
    handlePluginSwitch,
    questCache: get(store(state), 'questCache'),
    questSlots: get(store(state), 'questSlots'),
    questRecords: get(state, ['info', 'quests', 'records']),
    translation: questId => TranslationBundler(questId, state, { lngWikiId, lngQuestTitles, lngQuestDescriptions }),
    useTranslations: window.config.get('plugin.questbrowser.useTranslations') || false,
  })
)(({activePageTabId, activeTypeTabId, handlePluginSwitch, questCache, questSlots, questRecords, translation, useTranslations}) => 
  <>
    {
      times(5).map(i => {
        const quest = get(questCache, get(questSlots, [activeTypeTabId, activePageTabId, i]));
        const questId = get(quest, 'api_no');
        const questRecord = get(questRecords, questId);
        return <Quest
                 key={i}
                 questData={quest}
                 questRecord={questRecord}
                 translation={translation(questId)}
                 useTranslations={useTranslations}
                 onClick={partial(handlePluginSwitch, questId)}
               />
      })
    }
  </>
)

@connect((state, props) => ({
  activeTypeTabId: get(state, 'ui.quest-browser-activeTypeTabId', 0),
  activePageTabId: get(state, 'ui.quest-browser-activePageTabId', 0),
  questInfoSwitch: get(state, 'config.plugin.poi-plugin-quest-info.enable', false) &&
                     !get(state, 'config.poi.plugin.windowmode.poi-plugin-quest-info.enable', false),
  maxPages: get(store(state), 'maxPages', {}),
  lngWikiId: window.config.get('plugin.questbrowser.lngWikiId') || 'native',
  lngQuestTitles: window.config.get('plugin.questbrowser.lngQuestTitles') || 'native',
  lngQuestDescriptions: window.config.get('plugin.questbrowser.lngQuestDescriptions') || 'native',
}))
export class reactClass extends Component {
  static propTypes = {
    activeTypeTabId: PropTypes.number.isRequired,
    activePageTabId: PropTypes.number.isRequired,
    questInfoSwitch: PropTypes.bool.isRequired,
    maxPages: PropTypes.object.isRequired,
  }

  handleTypeTabClick = (idx) => {
    if (idx != this.props.activeTypeTabId) {
      dispatch({
        type: '@@TabSwitch',
        tabInfo: {
          'quest-browser-activeTypeTabId': idx,
          'quest-browser-activePageTabId': 0,
        },
      })
    }
  }
  
  handlePageTabClick = (idx) => {
    if (idx != this.props.activePageTabId) {
      dispatch({
        type: '@@TabSwitch',
        tabInfo: {
          'quest-browser-activePageTabId': idx,
        },
      })
    }
  }
  
  handleNavigationClick = (idx) => {
    dispatch({
      type: '@@TabSwitch',
      tabInfo: {
        'quest-browser-activePageTabId': [0, 
                                          this.props.activePageTabId - 1,
                                          this.props.activePageTabId + 1,
                                          this.props.maxPages[this.props.activeTypeTabId] - 1][idx],
      },
    })
  }
  
  handleResponse = (e) => {
    if(e.detail.path === "/kcsapi/api_get_member/questlist") {
      if (e.detail.postBody.api_page_no - 1 != this.props.activePageTabId) {
        dispatch({
          type: '@@TabSwitch',
          tabInfo: {
            'quest-browser-activePageTabId': e.detail.postBody.api_page_no - 1,
          },
        })
      }
      if (apiQuestTypeTabIds[e.detail.postBody.api_tab_id] != this.props.activeTypeTabId) {
        dispatch({
          type: '@@TabSwitch',
          tabInfo: {
            'quest-browser-activeTypeTabId': apiQuestTypeTabIds[e.detail.postBody.api_tab_id],
          },
        })
      }
    }
  }
  
  handlePluginSwitch = (questId) => {
    if(this.props.questInfoSwitch) {
      try {
        ipc.access('quest-info').switchTo(questId);
        dispatch({
          type: '@@TabSwitch',
          tabInfo: {
            activeMainTab: 'poi-plugin-quest-info',
          },
        })
      } catch(err) {
        log.error("poi-plugin-quest-browser: handlePluginSwitch failed\n" + err);
      }
    }
  }

  componentWillUnmount() {
    layoutResizeObserver.unobserve(this.panel);
    window.removeEventListener('game.response', this.handleResponse);
  }

  componentDidMount() {
    layoutResizeObserver.observe(this.panel);
    window.addEventListener('game.response', this.handleResponse);
    loadTranslations();
  }

  render() {
    const activePageTabId = this.props.activePageTabId || 0;
    const activeTypeTabId = this.props.activeTypeTabId || 0;
    const currMaxPages = this.props.maxPages[activeTypeTabId] || 0;
    const off = Math.min(Math.max(currMaxPages - 5, 0), Math.max(activePageTabId - 2, 0));
    return (
      <>
      <link rel="stylesheet" href={join(__dirname, 'style.css')} />
        <div className = "QuestView">
          <Panel>
            <Panel.Body>
              <div className="no-scroll quest-panel">
                <div className="quest-top-container">
                  <div className="quest-type-button-container">
                    <ButtonGroup vertical>
                      {
                        times(7).map(i =>
                          <QuestTypeSwitchButton
                            key={i}
                            questTypeTabId={i}
                            onClick={e => this.handleTypeTabClick(i)}
                            activeTypeTabId={activeTypeTabId}
                          />
                        )
                      }
                    </ButtonGroup>
                  </div>
                  <div className="quest-item-container" ref={ref => { this.panel = ref }}>
                    <QuestPanel
                      activeTypeTabId={activeTypeTabId}
                      activePageTabId={activePageTabId}
                      handlePluginSwitch={this.handlePluginSwitch}
                      lngWikiId={this.props.lngWikiId}
                      lngQuestTitles={this.props.lngQuestTitles}
                      lngQuestDescriptions={this.props.lngQuestDescriptions}
                    />
                  </div>
                </div>
                <div className="quest-nav-button-container">
                    <ButtonGroup>
                      <NavigationButton
                        key={0}
                        navId={0}
                        onClick={e => this.handleNavigationClick(0)}
                        activePageTabId={activePageTabId}
                        disabled={activePageTabId == 0 || currMaxPages == 0}
                      />
                      <NavigationButton
                        key={1}
                        navId={1}
                        onClick={e => this.handleNavigationClick(1)}
                        activePageTabId={activePageTabId}
                        disabled={activePageTabId == 0 || currMaxPages == 0}
                      />
                    </ButtonGroup>
                    <ButtonGroup className="quest-nav-page-button">
                      { 
                        times(5).map(i =>
                          <QuestPageSwitchButton
                            questPageTabId={i+off}
                            onClick={e => this.handlePageTabClick(i+off, currMaxPages)}
                            activePageTabId={activePageTabId}
                            currMaxPages={currMaxPages}
                          />
                        )
                      }
                    </ButtonGroup>
                    <ButtonGroup>
                      <NavigationButton
                        key={2}
                        navId={2}
                        onClick={e => this.handleNavigationClick(2)}
                        activePageTabId={activePageTabId}
                        disabled={activePageTabId == currMaxPages - 1 || currMaxPages == 0}
                      />
                      <NavigationButton
                        key={3}
                        navId={3}
                        onClick={e => this.handleNavigationClick(3)}
                        activePageTabId={activePageTabId}
                        disabled={activePageTabId == currMaxPages - 1 || currMaxPages == 0}
                      />
                    </ButtonGroup>
                </div>
              </div>
            </Panel.Body>
          </Panel>
        </div>
      </>
    )
  }
}

const switchPluginPath = [
  {
    path: '/kcsapi/api_get_member/questlist',
    valid: () => true,
  },
]

export { switchPluginPath, reducer, settingsClass };