import { connect } from 'react-redux'
import React, { Component } from 'react'
import { PropTypes } from 'prop-types'
import { Button, Checkbox, Menu, MenuDivider, MenuItem, Position } from '@blueprintjs/core'
import { get, memoize } from 'lodash'

import { Popover } from 'views/components/etc/overlay'

import { settingsChoiseLayout } from './constants'

import i18next from 'views/env-parts/i18next'

const SettingsWikiIdLngMenu = connect(
  (state, { lngWikiId }) => memoize((state) => lngWikiId)
)(({ lngWikiId, lngId, onClick, currLngWikiId, questInfoAvail }) => {
  if (lngId == 'div')
    return <MenuDivider />
  else if (lngId == 'head')
    return (
      <MenuDivider title={i18next.t('poi-plugin-quest-browser:KC3-header')} />
    )
  else
    return (
      <MenuItem eventKey={lngId}
        disabled={lngId == 'questInfoTrans' && !questInfoAvail}
        onClick={onClick}
        active={lngId == currLngWikiId}
        text={i18next.t('poi-plugin-quest-browser:' + (lngId == 'native' ? 'none' : lngId))} />
    )
}
)

const SettingsQuestTitleLngMenu = connect(
  (state, { lngQuestTitles }) => memoize((state) => lngQuestTitles)
)(({ lngQuestTitles, lngId, onClick, currLngQuestTitle, questInfoAvail }) => {
  if (lngId == 'div')
    return <MenuDivider />
  else if (lngId == 'head')
    return (
      <MenuDivider title={i18next.t('poi-plugin-quest-browser:KC3-header')} />
    )
  else
    return (
      <MenuItem eventKey={lngId}
        disabled={lngId == 'questInfoTrans' && !questInfoAvail}
        onClick={onClick}
        active={lngId == currLngQuestTitle}
        text={i18next.t('poi-plugin-quest-browser:' + lngId)} />
    )
}
)

const SettingsQuestDescLngMenu = connect(
  (state, { lngQuestDescriptions }) => memoize((state) => lngQuestDescriptions)
)(({ lngQuestDescriptions, lngId, onClick, currLngQuestDesc, questInfoAvail }) => {
  if (lngId == 'div')
    return <MenuDivider />
  else if (lngId == 'head')
    return (
      <MenuDivider title={i18next.t('poi-plugin-quest-browser:KC3-header')} />
    )
  else
    return (
      <MenuItem eventKey={lngId}
        disabled={lngId == 'questInfoTrans' && !questInfoAvail}
        onClick={onClick}
        active={lngId == currLngQuestDesc}
        text={i18next.t('poi-plugin-quest-browser:' + lngId)} />
    )
}
)

@connect((state, props) => ({
  useTranslations: window.config.get('plugin.questbrowser.useTranslations') || false,
  questInfoAvail: (get(state, 'config.plugin.poi-plugin-quest-info.enable', false) || find(state.plugins, {'id': 'poi-plugin-quest-info'}).enabled) &&
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
          <p style = {true ? null : null}>Translation Sources</p>
          <Popover content={
            <Menu>
              {
                settingsChoiseLayout.map(i =>
                  <SettingsWikiIdLngMenu
                    lngId={i}
                    onClick={e => this.handleWikiIdClick(i)}
                    currLngWikiId={this.props.lngWikiId}
                    questInfoAvail={this.props.questInfoAvail}
                  />
                )
              }
            </Menu>
          }>
            <Button
              text='Wiki ID'
              key={0}
              id={`dropdown-trans-0`}
            />
          </Popover>
          <Popover content={
            <Menu>
              {
                settingsChoiseLayout.map(i =>
                  <SettingsQuestTitleLngMenu
                    lngId={i}
                    onClick={e => this.handleQuestTitleClick(i)}
                    currLngQuestTitle={this.props.lngQuestTitles}
                    questInfoAvail={this.props.questInfoAvail}
                  />
                )
              }
            </Menu>
          }>
            <Button
              text='Quest Titles'
              key={1}
              id={`dropdown-trans-1`}
            />
          </Popover>
          <Popover content={
            <Menu>
              {
                settingsChoiseLayout.map(i =>
                  <SettingsQuestDescLngMenu
                    lngId={i}
                    onClick={e => this.handleQuestDescriptionClick(i)}
                    currLngQuestDesc={this.props.lngQuestDescriptions}
                    questInfoAvail={this.props.questInfoAvail}
                  />
                )
              }
            </Menu>
          }>
            <Button
              text='Quest Descriptions'
              key={2}
              id={`dropdown-trans-2`}
            />
          </Popover>
        </div>
      </div>
    )
  }
}