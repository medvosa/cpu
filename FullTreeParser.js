const TOKEN_TYPES =  {
    SIGN : ['+','-','*','/','>','<','==','!=',':',',','=',],
    KEYWORD : ['if','while','else','func','var', 'return'],
    BRACKET:  ['[',']','{','}','(',')','begin','end',],
    SEPARATOR:[',',';',],
}

class Node{

}

class CodeTree{

}

class Token{

}

class FullTreeParser{
    tokens=[]
    typedTokens=[]
    constructor(code){
        let lines = code.split('\n');
        this.fullStr = lines.join(' ')
    }
    tokenize(){       
        for(let i of [...TOKEN_TYPES.SIGN, ...TOKEN_TYPES.BRACKET,...TOKEN_TYPES.SEPARATOR])
            this.fullStr = this.fullStr.replaceAll(i,' '+i+' ')
        this.fullStr = this.fullStr.replaceAll(/ +/g,' ')
        this.tokens=this.fullStr.split(' ').filter(i=>i)
    }
    tokenTypes(){ 
        function detectTokenType(token){ 
            for(let type in TOKEN_TYPES ){
                if(TOKEN_TYPES[type].indexOf(token)!=-1){
                    return type
                }
            }
            if(parseInt(token)>=0)
                return "INT"
            return 'NAME'
        }
        this.typedTokens = this.tokens.map(i=>({text:i, type:detectTokenType(i)}))
    }
    computeLevels(){ 
        let level=0
        this.leveledTokens = []
        let bracketPath=[]
        for(let token of this.typedTokens){
            if(token.type!='BRACKET'){
                console.log('no bracket',bracketPath)
                this.leveledTokens.push({...token, level, bracketPath:[...bracketPath]})
            }
            else{

                if(['[','(','{','begin'].indexOf(token.text)!=-1){
                    level++;
                    bracketPath.push(token.text)
                    console.log('set type:'+token.text)
                }
                else{
                    bracketPath.pop()
                    console.log('remove type')
                    level--
                }
            }
        }
    }
    lastLevelOnly(){
        this.lastLevelTokens = this.leveledTokens.map(i=>({...i, lastLevelType:i.bracketPath.pop()}))
    }
    levelGroups(){
        let res=[];
        let partGroup=[]
        let level=0;
        let type=''
        for(let k of this.lastLevelTokens){
            if((k.level!=level) || (k.lastLevelType!=type)){
                res.push(partGroup)
                partGroup=[]
            }
            partGroup.push(k)
            delete k.bracketPath
            level=k.level
            type=k.lastLevelType
        }
        res.push(partGroup)
        for(let i in res){
            res[i]={
                level:res[i]?.[0]?.level,
                leveltype:res[i]?.[0]?.lastLevelType,
                children:res[i]
            }
            if(res[i].children?.[0])
            for (let k of res[i].children){
                delete k.level;

                delete k.lastLevelType
            }
        }
        res = res.filter((i,num)=>num>0)
        console.log(JSON.stringify(res,null,2))
    }
    levelize(){
        function levelizeOnce(arr){
            let maxLevel = -1
            for(let k of arr)
                if(k.level>maxLevel)
                    maxLevel=k.level
            let res= []
            let part = []
            for(let i of arr)
                if(i.level==maxLevel)
                    part.push(i)
                else{
                    if(part.length){
                        res[res.length-1].children=part
                        part=[]
                    }{
                        res.push(i)
                    }
                }
            if(part.length){
                res[res.length-1].children=part
            }
            return res
        }
        let t = [...this.lastLevelTokens]
        function isSameLevel(arr){
            for(let k  of arr){
                if(k.level!=arr[0].level)
                    return false
            }
            return true
        }
        while(!isSameLevel(t) && t.length!=1){
            t = levelizeOnce(t)
            console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
            console.log(JSON.stringify(t))
            console.log('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')
        }
        return t
    }

}

function groupBy(arr, field, recursive){
    let name = arr.text
    arr = arr.children
    console.log('gby arr:',arr)
    let res = []
    let group = []
    let lastGroup = null
    for (let i of arr){
        if(i[field]!=lastGroup){
            if(group.length){
                res.push({type:group[0][field],lastLevelType:group[0][field],children:group,text:group[0][field]})
                group=[]
            }
            group=[i]
        }else{
            group.push(i)
        }
        lastGroup = i[field]
        // console.log(lastGroup)
    }
    if(group.length)res.push({type:group[0][field],lastLevelType:group[0][field],children:group,text:group[0][field]})
    console.log('groupBy res: ',res)
    
    // if(recursive){
    for(let k = 0 ; k< res[1].children.length; k++){
        console.log(res[1].children[k])
        if(res[1].children[k].text=='if' || res[1].children[k].text=='while'|| res[1].children[k].text=='func'|| res[1].children[k].text== 'module')
        res[1].children[k]=groupBy(res[1].children[k],field,false)
        console.log(res[1].children[k])
    }
        // while(1){};
    // }
    return {text:name,children:res}
}


let parsed = []

function multiplyNest(d){
    console.log(d)
    let size = d.children.length
    for(let i=0; i<d.children.length; i++){
        if(d.children[i]?.children){
            d.children[i] = multiplyNest(d.children[i])
        }
        if(d.children[i]?.text=='*'){
            console.log('multiply, children:',i, d.children[i].children, d.children[i].children?.length);
    //         // while(1){}

            // if(!(d.children[i].children?.length>0)){
                if(parsed.indexOf(d.children[i])==-1){
                    d.children[i].children?.push({text:'left', children:[
                        {text:d.children[i-1].text}
                    ]})
                    if(d.children[i].children){
                        d.children[i].children?.push({text:'right', children:[
                            ...d.children[i].children.filter(i=>i.text!='left')
                        ]})
                    }else{
                        d.children[i].children=[{text:'left', children:[
                            // ...d?.children?.[i+1]
                            d.children[i-1]
                        ]}]
                        d.children[i-1]={type:'removed'}
                        d.children[i].children.push({text:'right', children:[
                            // ...d?.children?.[i+1]
                            d.children[i+1]
                        ]})
                        // d.children[i+1]=null
                        // d.children[i-1]=null
                        // d.children[i+1]= null
                    }
                }
                parsed.push(d.children[i])
                d.children[i].children = d.children[i]?.children?.filter(i=>((i.text==='left') || (i.text==='right')))
                // d.children[i].children?.push({text:'right', children:d.children[i].children.filter(i=>i.text!='left')})
                //     // {text:'right',children:[d.children[i].children]},
                //     {text:'left', children:[d.children[i-1]]}
                // ]
                // d.children[i].children[d.children[i].children.length-1]={text:'right',children:d.children[i].children[d.children[i].children.length-1]}
                // d.children[i].children.push({text:'MUL_SEP'})
                // d.children[i].children.push(d.children[i-1])
                // d.children[i+1] = {text:'aftermul'}
                // console.log(i)
                // while(1){}
            // }
    //         else{
    //             // d.children[i].children=[{text:'right',children:d.children[i].children}]
    //             console.log('DEL:',d.children[i+1])
    //             // d.children[i+1] = null
    //         }
            // d.children[i+1] = null
            // for(let k = i+1; k<d.children.length-1;k++){
            //     d.children.k = d.children[k+1]
            // }
            // d.children.pop()
            // size--
            if(i<d.children.length-1){
                
                d.children[i+1]=d.children[i]
                i++
            }
        }
    }
    d.children = d.children.filter(i=>i)
    return d;
}

function printConsoleTree(v,level=0){
    const PAD = 3
    const PAD_SYMBOL = ' '
    const PAD_SYMBOL_LAST = '-'
    let start=''
    for(let i =0; i<level-1; i++)
        start+='|'+(PAD_SYMBOL.repeat(PAD))
    if(level)
    start+='|'+(PAD_SYMBOL_LAST.repeat(PAD))
    console.log(start+v.text+'  :  ' + v.lastLevelType)// +JSON.stringify(v))
    for(let i of v?.children??[]){
        printConsoleTree(i, level+1)
    }
}
let ftp = new FullTreeParser(`
    module (main) begin
        z = 1*2+3*(4+2*0)
        k=0

        y = 0 + 7 *(2+1)
        z = 2 * (2 + 2) + 0
        t = 2 * (8 + 9 * (6 - 4 ))

        k = 1+2*4* 9*6 +0
    end
`)

ftp.tokenize()
console.log(ftp.tokens)
ftp.tokenTypes()
console.log(ftp.typedTokens)
ftp.computeLevels()
ftp.lastLevelOnly()
// console.log(ftp.lastLevelTokens)
// console.log(JSON.stringify(ftp.levelize(),null,2))
let d = ftp.levelize()[0]
console.log('d:',)
multiplyNest(groupBy(d,'lastLevelType',true).children[1])
printConsoleTree(groupBy(d,'lastLevelType',true))
let t = multiplyNest(groupBy(d,'lastLevelType',true).children[1])
console.log(t)
printConsoleTree(t)
// console.log(ftp.levelize()[0].children[1])
// ftp.levelGroups()