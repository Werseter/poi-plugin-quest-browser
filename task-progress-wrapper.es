import { values, forEach } from 'lodash'
import React from 'react'
import { Trans } from 'react-i18next'
import { escapeI18nKey } from 'views/utils/tools'

export const sumSubgoals = (record) => {
  if (!record)
    return [0, 0]
  let [count, required] = [0, 0]
  forEach(record, (subgoal, key) => {
    if (subgoal && typeof subgoal === 'object') {
      count += subgoal.count
      required += subgoal.required
    }
  })
  return [count, required]
}

export const getStyleByProgress = (quest) => {
  if (!quest)
    return 'default'
  const {api_progress_flag, api_state} = quest
  if (api_state == 3)
    return 'success'
  switch (api_progress_flag) {
  case 0:
    return 'warning'
  case 1:
    return 'primary'
  case 2:
    return 'info'
  default:
    return 'default'
  }
}

export const getStyleByPercent = (percent) => {
  if (percent < 0.5)
    return 'warning'
  if (percent < 0.8)
    return 'primary'
  if (percent < 1)
    return 'info'
  return 'success'
}

export const getStyleByCompletion = (quest) => {
  if (!quest)
    return 'default'
  switch (quest.api_state) {
    case 2:
      return 'warning'
    case 3:
      return 'success'
    default:
      return 'default'
  }
}

export const progressLabelText = (quest) => {
  if (!quest)
    return ''
  switch (quest.api_progress_flag) {
  case 1:
    return '50%'
  case 2:
    return '80%'
  default:
    return ''
  }
}

export const completionLabelText = (quest) => {
  if (!quest)
    return ''
  switch (quest.api_state) {
    case 2:
      return <Trans>main:In progress</Trans>
    case 3:
      return <Trans>main:Completed</Trans>
    default:
      return ''
  }
}

export const getToolTip = (record) => {
  return (
    <>
      {
        values(record).map((subgoal, idx) =>
          (subgoal && typeof subgoal === 'object')
            ? <div key={idx}><Trans i18nKey={`data:${ escapeI18nKey(subgoal.description) }`}>{ subgoal.description }</Trans> - {subgoal.count} / {subgoal.required}</div>
            : undefined
        )
      }
    </>
  )
}