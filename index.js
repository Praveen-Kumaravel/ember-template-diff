const recast = require('ember-template-recast');
const treeDiffer = require('treediffer');
const visitorKeys = require('./visitorKeys');
const { readFile } = require('fs/promises')

async function readFileAsString(path) {  
  return await readFile(path, 'utf8')
} 

class ASTNode extends treeDiffer.TreeNode {
    isEqual(otherNode) {
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
}

run();