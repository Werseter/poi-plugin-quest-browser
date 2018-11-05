import { connect } from 'react-redux'
import React, { Component } from 'react'
import { PropTypes } from 'prop-types'
import { Panel, Checkbox, SplitButton, MenuItem } from 'react-bootstrap'
import { get, memoize } from 'lodash'

import { settingsChoiseLayout } from './constants'

import i18next from 'views/env-parts/i18next'

const SettingsWikiIdLngMenu = connect(
  (state, {lngWikiId}) => memoize((state) => lngWikiId)
)(({lngWikiId, lngId, onSelect, currLngWikiId, questInfoAvail}) => {
  if(lngId == 'div')
    return <MenuItem divider />
  else if(lngId == 'head')
    return (
      <MenuItem header>
        {i18next.t('poi-plugin-quest-browser:KC3-header')}
      </MenuItem>
    )
  else
    return (
      <MenuItem eventKey={lngId}
                disabled={lngId == 'questInfoTrans' && !questInfoAvail}
                onSelect={onSelect}
                className={lngId == currLngWikiId ? 'active' : ''}>
        {i18next.t('poi-plugin-quest-browser:' + (lngId == 'native' ? 'none' : lngId))}
      </MenuItem>
    )
  }
)

const SettingsQuestTitleLngMenu = connect(
  (state, {lngQuestTitles}) => memoize((state) => lngQuestTitles)
)(({lngQuestTitles, lngId, onSelect, currLngQuestTitle, questInfoAvail}) => {
  if(lngId == 'div')
    return <MenuItem divider />
  else if(lngId == 'head')
    return (
      <MenuItem header>
        {i18next.t('poi-plugin-quest-browser:KC3-header')}
      </MenuItem>
    )
  else
    return (
      <MenuItem eventKey={lngId}
                disabled={lngId == 'questInfoTrans' && !questInfoAvail}
                onSelect={onSelect}
                className={lngId == currLngQuestTitle ? 'active' : ''}>
        {i18next.t('poi-plugin-quest-browser:' + lngId)}
      </MenuItem>
    )
  }
)

const SettingsQuestDescLngMenu = connect(
  (state, {lngQuestDescriptions}) => memoize((state) => lngQuestDescriptions)
)(({lngQuestDescriptions, lngId, onSelect, currLngQuestDesc, questInfoAvail}) => {
  if(lngId == 'div')
    return <MenuItem divider />
  else if(lngId == 'head')
    return (
      <MenuItem header>
        {i18next.t('poi-plugin-quest-browser:KC3-header')}
      </MenuItem>
    )
  else
    return (
      <MenuItem eventKey={lngId}
                disabled={lngId == 'questInfoTrans' && !questInfoAvail}
                onSelect={onSelect}
                className={lngId == currLngQuestDesc ? 'active' : ''}>
        {i18next.t('poi-plugin-quest-browser:' + lngId)}
      </MenuItem>
    )
  }
)

@connect((state, props) => ({
  useTranslations: window.config.get('plugin.questbrowser.useTranslations') || false,
  questInfoAvail: get(state, 'config.plugin.poi-plugin-quest-info.enable', false) &&
                   !get(state, 'config.poi.plugin.windowmode.poi-plugin-quest-info.enable', false),
  lngWikiId: window.config.get('plugin.questbrowser.lngWikiId') || 'native',
  lngQuestTitles: window.config.get('plugin.questbrowser.lngQuestTitles') || 'native',
  lngQuestDescriptions: window.config.get('plugin.questbrowser.lngQuestDescriptions') || 'native',
}))
export class settingsClass extends Component {
  static propTypes = {
    useTranslations: PropTypes.bool.isRequired,
    questInfoAvail: PropTypes.bool.isRequired,
    lngWikiId: PropTypes.string.isRequired,
    lngQuestTitles: PropTypes.string.isRequired,
    lngQuestDescriptions: PropTypes.string.isRequired,
  }
  
  handleCheckbox = (e) => {
    window.config.set('plugin.questbrowser.useTranslations', !this.props.useTranslations)
  }
  
  handleWikiIdClick = (e) => {
    window.config.set('plugin.questbrowser.lngWikiId', e)
  }
  
  handleQuestTitleClick = (e) => {
    window.config.set('plugin.questbrowser.lngQuestTitles', e)
  }
  
  handleQuestDescriptionClick = (e) => {
    window.config.set('plugin.questbrowser.lngQuestDescriptions', e)
  }
  
  
  render() {
    return (
      <div>
        <Checkbox
          onChange={this.handleCheckbox}
          checked={this.props.useTranslations}
        >
          {i18next.t('poi-plugin-quest-browser:useTranslations')}
        </Checkbox>
        <div style={this.props.useTranslations ? null : {display: 'none'}}>
          <p>Translation Sources</p>
          <SplitButton
            bsStyle='default'
            title='Wiki ID'
            key={0}
            id={`dropdown-trans-0`}
          >
            { 
              settingsChoiseLayout.map(i =>
                <SettingsWikiIdLngMenu
                  lngId={i}
                  onSelect={e => this.handleWikiIdClick(i)}
                  currLngWikiId={this.props.lngWikiId}
                  questInfoAvail={this.props.questInfoAvail}
                />
              )
            }
          </SplitButton>
          <SplitButton
            bsStyle='default'
            title='Quest Titles'
            key={1}
            id={`dropdown-trans-1`}
          >
            { 
              settingsChoiseLayout.map(i =>
                <SettingsQuestTitleLngMenu
                  lngId={i}
                  onSelect={e => this.handleQuestTitleClick(i)}
                  currLngQuestTitle={this.props.lngQuestTitles}
                  questInfoAvail={this.props.questInfoAvail}
                />
              )
            }
          </SplitButton>
          <SplitButton
            bsStyle='default'
            title='Quest Descriptions'
            key={2}
            id={`dropdown-trans-2`}
          >
            { 
              settingsChoiseLayout.map(i =>
                <SettingsQuestDescLngMenu
                  lngId={i}
                  onSelect={e => this.handleQuestDescriptionClick(i)}
                  currLngQuestDesc={this.props.lngQuestDescriptions}
                  questInfoAvail={this.props.questInfoAvail}
                />
              )
            }
          </SplitButton>
        </div>
      </div>
    )
  }
}