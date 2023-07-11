const recast = require('ember-template-recast');
const treeDiffer = require('treediffer');
const {print: printAstNode} = require('@glimmer/syntax');
const visitorKeys = require('./visitorKeys');
const { readFile } = require('fs/promises');
const compare = require('./compareNodes');

async function readFileAsString(path) {  
  return await readFile(path, 'utf8')
} 

const NODE_TYPES_TO_CONSIDER = ['Template', 'Block', 'MustacheStatement',
    'BlockStatement', 'PartialStatement', 'ElementNode',
    'NamedBlock', 'SimpleElement', 'Component'];

class ASTNode extends treeDiffer.TreeNode {
    isEqual(other) {
        /*
        * TODO: Update this method to return false for different components
        * Can be parameterised to support multipe variants of diffing.
        */
        return compare(this.node, other.node);
    }

    getOriginalNodeChildren() {
        const visitorKey = visitorKeys[this.node.type];
        if (visitorKey && visitorKey.length) {
            return this.node[visitorKey[0]];
        }
        return [];
    }
}

treeDiffer.ASTNode = ASTNode;

async function run() {    
    const samples = ['./samples/owner-info.hbs', './samples/entity-name-cell-account.hbs']
    
    const [template1, template2] = await Promise.all(samples.map(readFileAsString));
    
    const tree1 = new treeDiffer.Tree(recast.parse(template1), treeDiffer.ASTNode);
    const tree2 = new treeDiffer.Tree(recast.parse(template2), treeDiffer.ASTNode);

    const diff = new treeDiffer.Differ(tree1, tree2)
        .transactions[ tree1.orderedNodes.length - 1 ][ tree2.orderedNodes.length - 1 ];

    const filteredTransactions = [];
    const counts = {
        inserts: 0,
        deletes: 0,
        updates: 0
    };

    const COUNT_TYPE_MAP = {
        '+': 'inserts',
        '-': 'deletes',
        '->': 'updates'
    }

    function processTransaction(type, nodeA, nodeB) {
        counts[COUNT_TYPE_MAP[type]]++;
        if (!nodeB) {
            if (NODE_TYPES_TO_CONSIDER.includes(nodeA.type)) {
                filteredTransactions.push(`${type} ${printAstNode(nodeA)}`);
            }

            return;
        }
        if (NODE_TYPES_TO_CONSIDER.includes(nodeA.type) || NODE_TYPES_TO_CONSIDER.includes(nodeB.type)) {
            filteredTransactions.push(`${printAstNode(nodeA)} ${type} ${printAstNode(nodeB)}`);
        }
    }

    let i, ilen;
    for ( i = 0, ilen = diff.length; i < ilen; i++ ) {
		if ( diff[ i ][ 0 ] !== null && diff[ i ][ 1 ] !== null ) {
            processTransaction('->', tree1.orderedNodes[ diff[ i ][ 0 ] ].node, tree2.orderedNodes[ diff[ i ][ 1 ] ].node)
		} else if ( diff[ i ][ 0 ] ) {
            processTransaction('-', tree1.orderedNodes[ diff[ i ][ 0 ] ].node);
		} else if ( diff[ i ][ 1 ] ) {
            processTransaction('+', tree2.orderedNodes[ diff[ i ][ 1 ] ].node);
		}
	}


    const insights = [];
    function buildInsights() {
        if (!counts.deletes && !counts.updates) {
            insights.push(`${samples[0]} is a subset of ${samples[1]} and can be reused`);
        }
    }
    
    buildInsights();
    console.log('Summary: ', counts);
    if (insights.length) {
        console.log('\nInsights:');
        console.log(insights.map((str, idx) => `${idx + 1}: ${str}`).join('\n'));
    }

    
    const SHOULD_PRINT_DIFF = false;
    SHOULD_PRINT_DIFF &&  console.log('Diffs: ', filteredTransactions);
}

run();