import { apiQuestTypeTabIds } from './constants'

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const initState = {
  questCache: {},
  questSlots: [{},{},{},{},{},{},{}],
  maxPages: Array(7).fill(0),
};

function reducer(state = initState, action) {
  const {
    type,
    body,
    postBody
  } = action;

  switch (type) {
    case '@@Response/kcsapi/api_get_member/questlist':
      {
        let { questCache, questSlots, maxPages } = state;
        maxPages[apiQuestTypeTabIds[postBody.api_tab_id]] = body.api_page_count;
        if(body.api_list != null) {
          for (var i = 0; i < 5; ++i) {
            const quest = body.api_list[i];
            if (quest && typeof quest === 'object') {
              questCache[quest.api_no] = quest;
              if (questSlots[apiQuestTypeTabIds[postBody.api_tab_id]] == null) questSlots[apiQuestTypeTabIds[postBody.api_tab_id]] = {};
              if (questSlots[apiQuestTypeTabIds[postBody.api_tab_id]][postBody.api_page_no - 1] == null) questSlots[apiQuestTypeTabIds[postBody.api_tab_id]][postBody.api_page_no - 1] = {};
              questSlots[apiQuestTypeTabIds[postBody.api_tab_id]][postBody.api_page_no - 1][i] = quest.api_no;
            }
            else {
              questSlots[apiQuestTypeTabIds[postBody.api_tab_id]][postBody.api_page_no - 1][i] = null;
            }
          }
        }
        else {
          questSlots[apiQuestTypeTabIds[postBody.api_tab_id]] = {};
        }
        return _extends({}, state, {questCache, questSlots, maxPages});
        break;
      }

    default:
  }

  return state;
}

export { reducer };