const recast = require('ember-template-recast');
const treeDiffer = require('treediffer');
const visitorKeys = require('./visitorKeys');
const { readFile } = require('fs/promises')

async function readFileAsString(path) {  
  return await readFile(path, 'utf8')
} 

class ASTNode extends treeDiffer.TreeNode {
    isEqual(otherNode) {
        /*
        * TODO: Update this method to return true for ignorable diffs like html tags, but false for different components
        * Can be parameterised to support multipe variants of diffing.
        */
        return this.node.type === otherNode.node.type;
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
    const samples = ['./samples/template-a.hbs', './samples/template-b.hbs']
    
    const [template1, template2] = await Promise.all(samples.map(readFileAsString));
    
    const tree1 = new treeDiffer.Tree(recast.parse(template1), treeDiffer.ASTNode);
    const tree2 = new treeDiffer.Tree(recast.parse(template2), treeDiffer.ASTNode);

    const diff = new treeDiffer.Differ(tree1, tree2)
        .transactions[ tree1.orderedNodes.length - 1 ][ tree2.orderedNodes.length - 1 ];
    
    console.log(diff);
    let i, ilen;
    for ( i = 0, ilen = diff.length; i < ilen; i++ ) {
		if ( diff[ i ][ 0 ] !== null && diff[ i ][ 1 ] !== null ) {
			console.log( 'change', tree1.orderedNodes[ diff[ i ][ 0 ] ].node.type );
			console.log('change' , tree2.orderedNodes[ diff[ i ][ 1 ] ].node.type );
		} else if ( diff[ i ][ 0 ] ) {
			console.log('remove' , tree1.orderedNodes[ diff[ i ][ 0 ] ].node.type );
		} else if ( diff[ i ][ 1 ] ) {
			console.log('insert' , tree2.orderedNodes[ diff[ i ][ 1 ] ].node.type );
		}
	}
}

run();