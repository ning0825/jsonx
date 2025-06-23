/**
 * 高级JSON格式化工具
 * 
 * 功能：
 * 1. 智能格式化与缩进
 * 2. 错误定位与提示
 * 3. 自动修复常见的JSON语法错误
 * 4. 支持大型JSON的性能优化
 * 5. 键排序与组织
 * 6. 智能检测特殊值（URL、时间等）
 */

// 格式化选项
const formatOptions = {
    indentSize: 2, // 缩进大小
    maxDisplayLength: 5000, // 大型JSON优化显示长度
    autoFix: false, // 自动修复常见错误
    sortKeys: false, // 是否自动排序键
    detectTypes: true // 智能检测特殊类型
};

/**
 * 格式化JSON字符串
 * @param {string} jsonString - 要格式化的JSON字符串
 * @param {Object} options - 格式化选项
 * @returns {Object} 格式化结果对象
 */
function formatJSON(jsonString, options = {}) {
    console.log('formatJSON', jsonString, options);
    const {
        indentSize = formatOptions.indentSize,
            autoFix = formatOptions.autoFix,
            sortKeys = formatOptions.sortKeys,
            detectTypes = formatOptions.detectTypes
    } = options;

    if (!jsonString || !jsonString.trim()) {
        return { formatted: "", object: null, error: null };
    }

    let fixedString = jsonString;
    let wasFixed = false;

    // 自动修复常见错误
    if (autoFix) {
        const originalString = fixedString;

        // 1. 修复单引号改为双引号
        fixedString = fixedString.replace(/(\w+)\'(\s*):(\s*)/g, '"$1"$2:$3');
        fixedString = fixedString.replace(/:\s*\'([^\']*)\'/g, ': "$1"');

        // 2. 修复尾随逗号
        fixedString = fixedString.replace(/,(\s*[\}\]])/g, '$1');

        // 3. 修复缺少双引号的键
        fixedString = fixedString.replace(/(\{|\,)(\s*)([a-zA-Z0-9_\-]+)(\s*):/g, '$1$2"$3"$4:');

        // 4. 尝试修复JavaScript代码中的undefined、NaN等
        fixedString = fixedString.replace(/:\s*undefined/g, ': null');
        fixedString = fixedString.replace(/:\s*NaN/g, ': "NaN"');
        fixedString = fixedString.replace(/:\s*function\s*\([^\)]*\)\s*\{[^\}]*\}/g, ': "Function"');

        // 5. 尝试添加缺失的引号
        fixedString = fixedString.replace(/:(\s*)([a-zA-Z0-9_\-]+)(\s*[,\}])/g, ': "$2"$3');

        // 检查是否进行了修复
        wasFixed = fixedString !== originalString;
    }

    try {
        // 解析JSON
        const parsedObject = JSON.parse(fixedString);

        // 处理对象（排序、类型检测等）
        const processedObject = processObject(parsedObject, { sortKeys, detectTypes });

        // 使用指定缩进格式化
        const formatted = JSON.stringify(processedObject, null, indentSize);

        return {
            formatted,
            object: processedObject,
            error: null,
            wasFixed
        };
    } catch (e) {
        // 定位错误位置并提供更友好的错误信息
        const errorInfo = parseJSONError(e, fixedString);
        return {
            formatted: "",
            object: null,
            error: errorInfo,
            wasFixed
        };
    }
}

/**
 * 处理对象（排序键、类型检测等）
 */
function processObject(obj, options) {
    const { sortKeys, detectTypes } = options;

    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    // 处理数组
    if (Array.isArray(obj)) {
        return obj.map(item => processObject(item, options));
    }

    // 处理对象
    let keys = Object.keys(obj);

    // 排序键
    if (sortKeys) {
        keys = keys.sort((a, b) => a.localeCompare(b, undefined, {
            numeric: true,
            sensitivity: 'base'
        }));
    }

    // 创建新对象
    const result = {};

    // 处理每个键
    keys.forEach(key => {
        const value = obj[key];

        // 递归处理嵌套对象
        result[key] = processObject(value, options);

        // 智能类型检测（可以在这里添加针对URL、日期等的特殊处理）
        if (detectTypes && typeof value === 'string') {
            // 例如：检测URL、日期、颜色等
            if (/^https?:\/\//.test(value)) {
                // 可以为URL添加特殊标记
            } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                // 可以为ISO日期添加特殊标记
            }
        }
    });

    return result;
}

/**
 * 解析JSON错误，提供详细的位置和建议
 */
function parseJSONError(error, jsonString) {
    const message = error.message;
    const positionMatch = /position\s+(\d+)/.exec(message);

    if (positionMatch && positionMatch[1]) {
        const position = parseInt(positionMatch[1]);
        const lines = jsonString.substring(0, position).split('\n');
        const lineNumber = lines.length;
        const columnNumber = lines[lines.length - 1].length + 1;

        // 提取错误上下文
        const errorLineStart = Math.max(0, lineNumber - 3);
        const errorLineEnd = Math.min(jsonString.split('\n').length, lineNumber + 3);
        const errorContext = jsonString.split('\n')
            .slice(errorLineStart, errorLineEnd)
            .map((line, i) => {
                const currentLineNumber = errorLineStart + i + 1;
                const prefix = currentLineNumber === lineNumber ? '> ' : '  ';
                return `${prefix}${currentLineNumber}: ${line}`;
            })
            .join('\n');

        // 高亮错误字符
        const highlightedPosition =
            '   ' + ' '.repeat(columnNumber) + '^\n' +
            '   ' + ' '.repeat(columnNumber) + '|';

        return {
            message: `JSON解析错误：${message}`,
            line: lineNumber,
            column: columnNumber,
            context: errorContext,
            highlightedPosition,
            position,
            suggestion: getSuggestionForError(message, jsonString, position)
        };
    }

    return {
        message: `JSON解析错误：${message}`,
        suggestion: "请检查JSON语法是否正确"
    };
}

/**
 * 根据错误提供修复建议
 */
function getSuggestionForError(errorMessage, jsonString, position) {
    if (errorMessage.includes('Expected property name or') || errorMessage.includes('Expected double-quoted property name')) {
        return "可能缺少属性名的双引号，或者存在多余的逗号";
    } else if (errorMessage.includes('Unexpected end of JSON input')) {
        return "JSON不完整，请检查括号或大括号是否闭合";
    } else if (errorMessage.includes('Expected')) {
        const expectedChar = /Expected\s+'([^']+)'/.exec(errorMessage);
        if (expectedChar && expectedChar[1]) {
            return `在位置 ${position} 缺少字符 '${expectedChar[1]}'`;
        }
    }

    // 分析错误周围的字符以提供更具体的建议
    const start = Math.max(0, position - 10);
    const end = Math.min(jsonString.length, position + 10);
    const context = jsonString.substring(start, end);

    if (context.includes('{') && !context.includes('}')) {
        return "缺少右大括号 }";
    } else if (context.includes('[') && !context.includes(']')) {
        return "缺少右方括号 ]";
    } else if (context.includes('"') && (context.match(/"/g) || []).length % 2 !== 0) {
        return "可能有未闭合的引号";
    } else if (context.includes(':') && !context.includes(',') && !context.includes('}')) {
        return "可能缺少逗号或右大括号";
    }

    return "请检查JSON语法是否符合规范";
}

/**
 * 优化处理大型JSON
 * @param {Object} jsonObj - JSON对象
 * @param {number} maxLength - 显示的最大长度
 * @returns {Object} 处理后的对象
 */
function optimizeForLargeJSON(jsonObj, maxLength = 5000) {
    const jsonStr = JSON.stringify(jsonObj);

    if (jsonStr.length <= maxLength) {
        return jsonObj;
    }

    // 对于大型对象，可以考虑简化显示方式
    if (Array.isArray(jsonObj)) {
        if (jsonObj.length <= 100) {
            return jsonObj;
        }

        // 对于超大数组，只显示前后部分
        return [
            ...jsonObj.slice(0, 50),
            { __note__: `... ${jsonObj.length - 100} more items ...` },
            ...jsonObj.slice(jsonObj.length - 50)
        ];
    }

    if (typeof jsonObj === 'object' && jsonObj !== null) {
        const keys = Object.keys(jsonObj);
        if (keys.length <= 50) {
            return jsonObj;
        }

        // 对于超大对象，只显示一部分键
        const result = {};
        keys.slice(0, 25).forEach(key => {
            result[key] = jsonObj[key];
        });
        result.__note__ = `... ${keys.length - 50} more properties ...`;
        keys.slice(keys.length - 25).forEach(key => {
            result[key] = jsonObj[key];
        });

        return result;
    }

    return jsonObj;
}

/**
 * 使用示例:
 *
 * // 基本格式化
 * const result = formatJSON('{"name":"John", "age":30}');
 * console.log(result.formatted);
 * 
 * // 自动修复错误
 * const fixedResult = formatJSON('{name:"John", age:30,}');
 * console.log(fixedResult.formatted);
 * console.log(fixedResult.wasFixed);
 * 
 * // 显示错误信息
 * const errorResult = formatJSON('{name:"John", age:30,');
 * if (errorResult.error) {
 *   console.error(errorResult.error.message);
 *   console.error(errorResult.error.context);
 *   console.error(errorResult.error.highlightedPosition);
 *   console.error(`建议: ${errorResult.error.suggestion}`);
 * }
 */

export default formatJSON;