import { apiQuestTypeTabIds } from './constants'
import { readJSON } from 'fs-extra'
import { join } from 'path-extra'
import { mapValues } from 'lodash'

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
function _splice(array, chunk_size) { return Object.assign({}, Array(Math.ceil(array.length / chunk_size)).fill().map((_, index) => index * chunk_size).map(begin => Object.assign(Object.assign({}, Array(chunk_size).fill(null)), array.slice(begin, begin + chunk_size)))); }
        
const initState = {
  questCache: {},
  questSlots: [{},{},{},{},{},{},{}],
  translationBank: {},
  maxPages: Array(7).fill(0),
};

async function loadKC3Translation(transId) {
    const path = join(__dirname, 'translations', transId + '.json');
    let data;
    try {
      data = await readJSON(path);
    } catch (e) {
      console.warn('Error in reading', path, e);
    }
    const translations = mapValues(data, quest => ({
      wiki_id : quest.code,
      api_title : quest.name,
      api_detail : quest.desc
    }));
    dispatch({
      type : '@@poi-plugin-quest-browser@addTrans',
      translations,
      transId
    });
}

function loadQuestInfoTranslations() {
  const data = window.getStore('ext.poi-plugin-quest-info._.quests');
  const transId = 'questInfoTrans';
  const translations = mapValues(data, quest => ({
      wiki_id : quest.wiki_id,
      api_title : quest.name,
      api_detail : quest.condition
    }));
    dispatch({
      type : '@@poi-plugin-quest-browser@addTrans',
      translations,
      transId
    });
}

async function loadTranslations() {
  const KC3locales = ['KC3-en-US', 'KC3-ja-JP', 'KC3-ko-KR', 'KC3-zh-CN', 'KC3-zh-TW'];
  for(var i = 0; i < KC3locales.length; ++i) {
    await loadKC3Translation(KC3locales[i]);
  }
  loadQuestInfoTranslations();
  dispatch({
    type : '@@poi-plugin-quest-browser@addTrans',
    translations : {},
    transId : 'native'
  });
}

function patchNativeTranslation(quest) {
  return {
      wiki_id : quest.wiki_id,
      api_title : quest.api_title,
      api_detail : quest.api_detail
    };
}

function dispatchFetchActiveCache() {
  dispatch({
    type: '@@poi-plugin-quest-browser@fetchActiveCache',
    body: window.getStore('info.quests.activeQuests')
  });
}

function reducer(state = initState, action) {
  const {
    type,
    body,
    postBody
  } = action;

  switch (type) {
    case '@@poi-plugin-quest-browser@addTrans':
      {
        let { translationBank } = state;
        let { transId, translations } = action;
        translationBank[transId] = translations;
        return _extends({}, state, { translationBank });
      }
    
    case '@@poi-plugin-quest-browser@fetchActiveCache':
      {
        let { questCache, translationBank, questSlots, maxPages } = state;
        let questActiveCache = body;
        let extractedQuests = Object.keys(questActiveCache).reduce((sum, curr) => Object.assign(sum, {[curr]: questActiveCache[curr].detail}), {});
        questCache = _extends({}, questCache, extractedQuests);
        questSlots[1] = _splice(Object.keys(extractedQuests), 5);
        maxPages[1] = Object.keys(questSlots[1]).length;
        Object.values(extractedQuests).forEach(quest => {translationBank.native[quest.api_no] = patchNativeTranslation(quest)});
        return _extends({}, state, { questCache, translationBank, questSlots, maxPages });
      }
    case '@@Response/kcsapi/api_get_member/questlist':
      {
        let { questCache, translationBank, questSlots, maxPages } = state;
        maxPages[apiQuestTypeTabIds[postBody.api_tab_id]] = Math.ceil(body.api_count / 5);
        questSlots[apiQuestTypeTabIds[postBody.api_tab_id]] = {};
        for (var i = 0; i < body.api_count; ++i) {
          const quest = body.api_list[i];
          let page_no = Math.floor(i / 5);
          let slot_no = i % 5;
          questCache[quest.api_no] = quest;
          translationBank.native[quest.api_no] = patchNativeTranslation(quest);
          if (questSlots[apiQuestTypeTabIds[postBody.api_tab_id]] == null) questSlots[apiQuestTypeTabIds[postBody.api_tab_id]] = {};
          if (questSlots[apiQuestTypeTabIds[postBody.api_tab_id]][page_no] == null) questSlots[apiQuestTypeTabIds[postBody.api_tab_id]][page_no] = {};
          questSlots[apiQuestTypeTabIds[postBody.api_tab_id]][page_no][slot_no] = quest.api_no;
        }
        return _extends({}, state, {questCache, questSlots, translationBank, maxPages});
      }

    default:
  }

  return state;
}

export { reducer, loadTranslations, dispatchFetchActiveCache };