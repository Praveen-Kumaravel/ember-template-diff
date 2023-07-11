const COMPARISON_KEYS = {
    'MustacheStatement': 'path.original',
    'BlockStatement': 'path.original',
    'ElementNode': 'tag'
}

function getValueByKey(obj, key) {
    return key.split('.').reduce((prev, curr) => {
        return prev[curr];
    }, obj);
}

function compare(nodeA, nodeB) {
    if (nodeA.type !== nodeB.type) {
        return false;
    }
    const comparisonKey = COMPARISON_KEYS[nodeA.type];
    if (comparisonKey) {
        return getValueByKey(nodeA, comparisonKey) === getValueByKey(nodeB, comparisonKey);
    }

    return true;
}

module.exports = compare;