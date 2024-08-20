import { formatDate, parseDate } from '../utils';

const allowStatsType = ['time', 'datetime', 'day', 'month', 'year'];

export const useDate = () => {
  /**
   * 格式化日期
   * @param {Date|String} date 要格式化的日期
   * @param {String} statsType 输出日期类型
   * @param {String} format 输入日期的格式
   */
  const formatDateByStatsType = (
    date: string | number | Date,
    statsType = 'day',
    format = 'YYYY-MM-DD',
  ) => {
    if (date == null) return undefined;
    if (statsType == null) return date;
    statsType = allowStatsType.indexOf(statsType) === -1 ? 'day' : statsType;
    if (statsType === 'datetime') format = 'YYYY-MM-DD HH:mm:ss';

    const tempDate = date instanceof Date ? date : parseDate(date, format);
    if (!tempDate) return undefined;
    switch (statsType) {
      case 'time':
        return formatDate(tempDate, 'HH:mm:ss');
      case 'datetime':
        return formatDate(tempDate, 'YYYY-MM-DD HH:mm:ss');
      case 'day':
        return formatDate(tempDate, 'YYYY-MM-DD');
      case 'month':
        return formatDate(tempDate, 'YYYY-MM');
      case 'year':
        return formatDate(tempDate, 'YYYY');
      default:
        return formatDate(tempDate, 'YYYY-MM-DD');
    }
  };

  /**
   * 根据输入的日期获得日期范围（例如：输入2019-12-12，输出['2019-12-12 00:00:00', '2019-12-12 23:59:59']）
   * @param {Date|String} date 要转换的日期
   * @param {String} statsType 转换类型（day, month, year）
   * @param {String} format 输出格式
   */
  const getDateRangeFilter = (date: string, statsType = 'day', format = 'YYYY-MM-DD HH:mm:ss') => {
    if (date == null) return [];
    const tempDate = parseDate(date, format);
    console.log('tempDate', tempDate);
    if (tempDate && tempDate.isValid()) {
      switch (statsType) {
        case 'day':
          return [tempDate.startOf('d').format(format), tempDate.endOf('d').format(format)];
        case 'month':
          return [tempDate.startOf('M').format(format), tempDate.endOf('M').format(format)];
        case 'year':
          return [tempDate.startOf('y').format(format), tempDate.endOf('y').format(format)];
        default:
          return [];
      }
    } else {
      return [];
    }
  };

  return {
    formatDateByStatsType,
    getDateRangeFilter,
  };
};
