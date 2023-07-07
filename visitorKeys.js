const visitorKeys = {
  Program: ['body'],
  Template: ['body'],
  Block: ['body'],

  MustacheStatement: [],
  BlockStatement: ['program'],
  ElementModifierStatement: [],
  PartialStatement: [],
  CommentStatement: [],
  MustacheCommentStatement: [],
  ElementNode: ['children'],
  AttrNode: ['value'],
  TextNode: [],

  ConcatStatement: ['parts'],
  SubExpression: [],
  PathExpression: [],
  PathHead: [],

  StringLiteral: [],
  BooleanLiteral: [],
  NumberLiteral: [],
  NullLiteral: [],
  UndefinedLiteral: [],

  Hash: ['pairs'],
  HashPair: ['value'],

  // v2 new nodes
  NamedBlock: ['children'],
  SimpleElement: ['children'],
  Component: ['children'],
};

module.exports = visitorKeys;