import { BaseController } from '@/api/BaseController';
import { RequestOption } from '@/common/http/types';
import { DictData, DictionaryBase } from '@/common/staticDict/types';
import { ANY_OBJECT } from '@/types/generic';
import { API_CONTEXT } from '../config';

export default class DictionaryController extends BaseController {
  static dictSysRole(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return new Promise<DictionaryBase>((resolve, reject) => {
      super
        .get<DictData[]>(API_CONTEXT + '/upms/sysRole/listDict', params, httpOptions)
        .then(res => {
          const dictData = new DictionaryBase('角色字典', res.data);
          resolve(dictData);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  // 全局编码字典
  static dictGlobalDict(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return new Promise<DictionaryBase>((resolve, reject) => {
      super
        .get<DictData[]>(API_CONTEXT + '/upms/globalDict/listDict', params, httpOptions)
        .then(res => {
          const dictData = new DictionaryBase(
            '编码字典',
            (res.data || []).map(item => {
              return {
                ...item,
                // 设置已禁用编码字典数据项
                disabled: item.status === 1,
              };
            }),
          );
          resolve(dictData);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  static dictGlobalDictByIds(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return new Promise<DictionaryBase>((resolve, reject) => {
      super
        .get<DictData[]>(API_CONTEXT + '/upms/globalDict/listDictByIds', params, httpOptions)
        .then(res => {
          const dictData = new DictionaryBase('编码字典', res.data);
          resolve(dictData);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  static dictSysDept(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return new Promise<DictionaryBase>((resolve, reject) => {
      super
        .get<DictData[]>(API_CONTEXT + '/upms/sysDept/listDict', params, httpOptions)
        .then(res => {
          const dictData = new DictionaryBase('部门字典', res.data);
          resolve(dictData);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  static dictSysDeptByParentId(
    params: ANY_OBJECT,
    httpOptions?: RequestOption,
  ): Promise<DictionaryBase> {
    return new Promise<DictionaryBase>((resolve, reject) => {
      super
        .get<DictData[]>(API_CONTEXT + '/upms/sysDept/listDictByParentId', params, httpOptions)
        .then(res => {
          const dictData = new DictionaryBase('部门字典', res.data);
          resolve(dictData);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  static dictSysMenu(params: ANY_OBJECT, httpOptions?: RequestOption): Promise<DictionaryBase> {
    return new Promise<DictionaryBase>((resolve, reject) => {
      super
        .get<DictData[]>(API_CONTEXT + '/upms/sysMenu/listMenuDict', params, httpOptions)
        .then(res => {
          const dictData = new DictionaryBase('菜单字典', res.data);
          resolve(dictData);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  static dictDeptPost(params: ANY_OBJECT, httpOptions?: RequestOption): Promise<ANY_OBJECT[]> {
    return new Promise((resolve, reject) => {
      super
        .get<ANY_OBJECT[]>(
          API_CONTEXT + '/upms/sysDept/listSysDeptPostWithRelation',
          params,
          httpOptions,
        )
        .then(res => {
          resolve(res.data);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  static dictSysPost(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return new Promise<DictionaryBase>((resolve, reject) => {
      super
        .get<DictData[]>(API_CONTEXT + '/upms/sysPost/listDict', params, httpOptions)
        .then(res => {
          const dictData = new DictionaryBase('岗位字典', res.data);
          resolve(dictData);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  static dictReportDblink(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return new Promise<DictionaryBase>((resolve, reject) => {
      super
        .get<DictData[]>(API_CONTEXT + '/report/reportDblink/listDict', params, httpOptions)
        .then(res => {
          const dictData = new DictionaryBase('数据库链接', res.data);
          resolve(dictData);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  static dictReportDict(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return new Promise<DictionaryBase>((resolve, reject) => {
      super
        .get<DictData[]>(API_CONTEXT + '/report/reportDict/listDict', params, httpOptions)
        .then(res => {
          const dictData = new DictionaryBase('报表字典', res.data);
          resolve(dictData);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  static dictAreaCode(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return new Promise<DictionaryBase>((resolve, reject) => {
      super
        .get<DictData[]>(API_CONTEXT + '/app/areaCode/listDict', params, httpOptions)
        .then(res => {
          const dictData = new DictionaryBase('行政区划', res.data);
          resolve(dictData);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  static dictAreaCodeByParentId(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return new Promise<DictionaryBase>((resolve, reject) => {
      super
        .get<DictData[]>(API_CONTEXT + '/app/areaCode/listDictByParentId', params, httpOptions)
        .then(res => {
          const dictData = new DictionaryBase('行政区划', res.data);
          resolve(dictData);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  // 业务相关的接口
  static dictKnowledge(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return new Promise<DictionaryBase>((resolve, reject) => {
      super
        .get<DictData[]>('/admin/app/knowledge/listDict', params, httpOptions)
        .then(res => {
          const dictData = new DictionaryBase('知识点字典', res.data);
          resolve(dictData);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  static dictStudent(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return new Promise<DictionaryBase>((resolve, reject) => {
      super
        .get<DictData[]>(API_CONTEXT + '/app/student/listDict', params, httpOptions)
        .then(res => {
          const dictData = new DictionaryBase('学生字典', res.data);
          dictData.setList(res.data);
          resolve(dictData);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  static dictTeacher(params: ANY_OBJECT, httpOptions?: RequestOption) {
    return new Promise<DictionaryBase>((resolve, reject) => {
      super
        .get<DictData[]>('/admin/app/teacher/listDict', params, httpOptions)
        .then(res => {
          const dictData = new DictionaryBase('老师字典', res.data);
          resolve(dictData);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
}
