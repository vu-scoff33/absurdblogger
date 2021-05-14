//$$Current: First-Level contextual block -- next $$milestone to-do: 
//                              1) multi-level/nested abstraction of contextual block
//                              2) adding else & custom helpers


//$$futher optimize errors-capturer at parse run-time?
//

const GodelEngine = {

    parse: function(template){
        const GodelPatterns = /<(?:%(.*?)%|\$(.*?)\$)>/g;
        const matches = template.matchAll(GodelPatterns);
        let AST = [];
        let lastchop = 0; // chopping at last godel-pattern
        for (match of matches){
            if(match.index - lastchop !== 0)
                AST.push(template.substr(0, match.index - lastchop))
            AST.push(match[0]);
            template = template.slice(match.index + match[0].length - lastchop);
            lastchop = match.index + match[0].length;
        }
        if(template)
            AST.push(template)
        return AST;
    },
 
    compile: function(template){
        let AST = this.parse(template);
        const CodeBuilder = {
            codeArr: [],
            init: function(){
                const Declarations = "let HTMLstring = ''; "
                this.codeArr.push(Declarations);
            },
            addExpr: function(var_name){
                let statement = "HTMLstring += context." + var_name + ";";
                this.codeArr.push(statement)
            }, 
            addHtml: function(htmlChunk){
                let statement = "HTMLstring += " + "`" + htmlChunk + "`" + ";";
                this.codeArr.push(statement);
            },
            addBracket: function(bracket){
                if(bracket)
                    this.codeArr.push('}')
                else 
                    this.codeArr.push('{')
            }, //$$further abstraction: begin-block, close-block since not all logical blocks follow brackets structure
            end: function(){
                let statement = "return "  + "HTMLstring";
                this.codeArr.push(statement)
            }, 
            finalize: function(){
                return new Function('context', this.codeArr.join(' '));
            }
            //$$abstract out addingSemicoLon
        }
    
        let operators_stack = []; 
        CodeBuilder.init();
        AST.forEach(token => {
            if(token.startsWith('<%') && token.endsWith('%>')){
                let var_name = token.substr(2, token.length - 4).trim();
                CodeBuilder.addExpr(var_name);
            }
            else if(token.startsWith('<$') && token.endsWith('$>')){
                //logical blocks
                let [operator, ...logicalExpr] = token.substr(2, token.length - 4).trim().split(' ');
                if(operator === 'if'){
                    if(logicalExpr.length !== 1)
                        throw new Error("Incorrect conditional-if syntax.")
                    else{
                        operators_stack.push('if');
                        const condition = logicalExpr;
                        CodeBuilder.codeArr.push("if (" + condition + ")")
                        CodeBuilder.addBracket(0);
                    }
                }
                else if(operator === 'endif'){
                    if(operators_stack[operators_stack.length - 1] !== 'if')
                        throw new Error("No if to end");
                    else{ 
                        CodeBuilder.addBracket(1);
                        operators_stack.pop();
                    }
                }
                else if(operator === 'for'){
                    let conditions = logicalExpr;
                    //recheck ~ syntax: for x in arr_x
                    if(conditions.length !== 3 || conditions[1] !== 'in')  
                        throw new Error("Incorrect syntax of for-loop");
                    else{
                        CodeBuilder.codeArr.push(
                            `for(let index = 0; ${conditions[0]} = context.${conditions[3]}[index], index < context.${conditions[3]}.length; index++)`
                        );
                        CodeBuilder.addBracket(0);
                        operators_stack.push('for')
                    }
                }
                else if(operator === 'endfor'){
                    if(operators_stack[operators_stack.length - 1] !== 'for')
                        throw new Error("No for to end");
                    else{
                        CodeBuilder.addBracket(1);
                        operators_stack.pop();
                    }
                }
                else{
                    throw new Error("Un recognized Syntax");
                }
            }
            else if(token.startsWith('<#') && token.endsWith('#>')){
                //do nothing
                const comment = token.substr(2, token.length - 4).trim();
                CodeBuilder.addHtml("<!-- " + comment + "-->")
            }
            else{
                //literal html
                CodeBuilder.addHtml(token)
            }
        })
        CodeBuilder.end()
        return CodeBuilder.finalize()
    }
    
}


/* Syntaxes & easy-to-recognize + distinctive (disjointed) patterns (for ease of godelling as well as ease of parsing)
<% expression %>

--> simple expr & logical expr are disjointed for ease of identification at compile-time
<$ if condition $> --> adding '{'
    <% expr %>
<$endif $>  --> closing '}'

<$ for x in context.x $>
    <% expr %>
<$ endfor $>

<# commennts #>
*/


