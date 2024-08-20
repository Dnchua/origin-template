// import translations from "./zh";
//
// export default function customTranslate(template, replacements) {
//   replacements = replacements || {};
//
//   // Translate
//   template = translations[template] || template;
//
//   // Replace
//   return template.replace(/{([^}]+)}/g, function(_, key) {
//     let str = replacements[key];
//     if (
//       translations[replacements[key]] !== null &&
//       translations[replacements[key]] !== "undefined"
//     ) {
//       // eslint-disable-next-line no-mixed-spaces-and-tabs
//       str = translations[replacements[key]];
//       // eslint-disable-next-line no-mixed-spaces-and-tabs
//     }
//     return str || "{" + key + "}";
//   });
// }

import { ANY_OBJECT } from '@/types/generic';

const customTranslate = (translations: ANY_OBJECT) => {
  return function (template: string, replacements: ANY_OBJECT) {
    replacements = replacements || {};
    // Translate
    template = translations[template] || template;

    // Replace
    return template.replace(/{([^}]+)}/g, function (_, key) {
      let str = replacements[key];
      if (
        translations[replacements[key]] !== null &&
        translations[replacements[key]] !== undefined
      ) {
        str = translations[replacements[key]];
      }
      return str || '{' + key + '}';
    });
  };
};

export default customTranslate;
