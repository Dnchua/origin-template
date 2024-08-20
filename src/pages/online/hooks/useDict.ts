import combinedDict from '@/common/staticDict/combined';
import { SysCustomWidgetOperationType } from '@/common/staticDict';
import { SysOnlineDictType } from '@/common/staticDict/online';
import { OnlineOperationController } from '@/api/online';
import { ANY_OBJECT } from '@/types/generic';
import { post, get } from '@/common/http/request';

const StaticDict = { ...combinedDict };

export const useDict = () => {
  function getTableDictData(dictId: string, dictParams: ANY_OBJECT) {
    return new Promise<ANY_OBJECT[]>((resolve, reject) => {
      const filterDtoList = dictParams
        ? Object.keys(dictParams).map(key => {
            return {
              columnName: key,
              columnValue: dictParams[key],
            };
          })
        : [];
      const params = {
        dictId: dictId,
        filterDtoList: filterDtoList,
      };
      OnlineOperationController.listDict(params)
        .then(res => {
          resolve(res.data);
        })
        .catch(e => {
          reject(e);
        });
    });
  }

  function getDictDataByUrl(
    url: string,
    params: ANY_OBJECT,
    dictInfo: ANY_OBJECT,
    methods = 'get',
  ) {
    const request = methods == 'get' ? get : post;
    return new Promise<ANY_OBJECT[]>((resolve, reject) => {
      request(url, params)
        .then(res => {
          if (Array.isArray(res.data)) {
            resolve(
              res.data.map(item => {
                return {
                  id: item[dictInfo.keyColumnName],
                  name: item[dictInfo.valueColumnName],
                  parentId: item[dictInfo.parentKeyColumnName],
                };
              }),
            );
          } else {
            reject();
          }
        })
        .catch(e => {
          reject(e);
        });
    });
  }

  function getUrlDictData(dictInfo: ANY_OBJECT, dictParams: ANY_OBJECT) {
    const url = dictInfo.dictListUrl;
    if (url != null && url !== '') {
      return getDictDataByUrl(url, dictParams, dictInfo, 'get');
    } else {
      console.error('字典 [' + dictInfo.dictName + '] url为空');
      return Promise.reject();
    }
  }

  /**
   * 获取字典数据
   * @param {*} dictInfo 字典配置对象
   * @param {*} params 获取字典时传入的参数，仅对于数据表字典和URL字典有效
   * @returns 字典数据
   */
  function getDictDataList(dictInfo: ANY_OBJECT, dictParams: ANY_OBJECT): Promise<ANY_OBJECT[]> {
    const dicts = StaticDict as ANY_OBJECT;
    const dictData = JSON.parse(dictInfo.dictDataJson);
    switch (dictInfo.dictType) {
      case SysOnlineDictType.TABLE:
      case SysOnlineDictType.CODE:
        return getTableDictData(dictInfo.dictId, dictParams);
      case SysOnlineDictType.URL:
        return getUrlDictData(dictInfo, dictParams || {});
      case SysOnlineDictType.CUSTOM:
        if (dictData != null && Array.isArray(dictData.dictData)) {
          return Promise.resolve(dictData.dictData);
        } else {
          return Promise.reject(new Error('获取自定义字典数据错误！'));
        }
      case SysOnlineDictType.STATIC:
        if (
          dictData != null &&
          dictData.staticDictName != null &&
          dicts[dictData.staticDictName] != null
        ) {
          return Promise.resolve(dicts[dictData.staticDictName].getList());
        } else {
          return Promise.reject(new Error('未知的静态字典！'));
        }
      default:
        return Promise.reject(new Error('未知的字典类型！'));
    }
  }

  function getOperationPermCode(widget: ANY_OBJECT, operation: ANY_OBJECT) {
    const datasourceVariableName = (widget.datasource || {}).variableName;
    let temp = 'view';
    switch (operation.type) {
      case SysCustomWidgetOperationType.ADD:
      case SysCustomWidgetOperationType.EDIT:
      case SysCustomWidgetOperationType.DELETE:
        temp = 'edit';
        break;
      default:
        temp = 'view';
    }
    return 'online:' + datasourceVariableName + ':' + temp;
  }

  return { getDictDataList, getDictDataByUrl, getOperationPermCode };
};
