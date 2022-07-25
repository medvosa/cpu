import Compiler from './compiler.js'
import Device from './index.js'

const c1 = new Compiler()
const d =  new Device();
// test reverse array
/*
    d.loadDatamem([
        0x00000,0x00000,0x00000,
        0x0000,0x0002,0x0006,0x0A70,0x00C9,0x0235,0x0101,0x1000,
        0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,
    ])

    c1.parse(`
           ctomi1      7
           mi1tomem    3
    swap:  popmi1 3
           pushmi1     15
           jmp.eq      end
           jmp         swap
    end:   nop
    `)
*/
// test procedure call
/*
    jmp start
    
    adder:nop
        popmi2 5
        mi2tora

        memtomi1 0
        popmi2 5
        mosumtomi1
        mi1tomem 0

        ratomi2
        pushmi2 5
    ret 5
    
    start: nop
        ctomi1 5
        pushmi1 5
        call 5 adder

        
        ctomi1 2
        pushmi1 5
        call 5 adder

 */

d.loadDatamem([
    0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,
    0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,
    0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,0x0000,
])

if(
    c1.parse(`

    # working example without arguments 
    
    # ctora 1
    # jmp start
    # 
    # after: nop
    #     incra
    #     incra
    # ret 5
    # 
    # start: nop
    # 
    # call 5 after
    # call 5 after

    jmp start

    
    sumtox: nop
        popmi2 5
        ctomi1 1
        jmp.lt less
            # arg == 1
            popmi2 5
            ctomi1 1
            pushmi1 5
            pushmi2 5
            jmp endsumtox
        less:nop
            # arg > 1
            mi2tora 
            swpmi
            pushaddr 5 7
            mosubtomi1
            pushmi1 5
            call sumtox
            popmi2 5
            swpmi
            ratomi2
            mosumtomi1
            pushmi1 5
            pushmi2 5
            jmp endsumtox
        endsumtox: nop
    ret 5
    
    adder:nop
        #save address
        popmi2 5
        mi2tora

        # pop 2 arguments
        popmi2 5
        popmi1 5

        # calculate sum
        mosumtomi1

        # save return address
        popmi2 5

        # push answer
        pushmi1 5 

        # push return address
        ratomi2
        pushmi2 5

    ret 5

    mimax:nop
        #save address
        popmi2 5
        mi2tora

        popmi2 5
        swpmi
        popmi2 5
        jmp.lt good
            pushmi2 5
            pushmi1 5
        jmp endminax
        good:nop
            pushmi1 5
            pushmi2 5
        endminax: nop

        # push return address
        ratomi2
        pushmi2 5
    ret 5

    
    start: nop
        # return address + 14 to stack 5

        # args - 1
        ctomi1 100
        pushmi1 5
        ctomi1 50
        pushmi1 5

        pushaddr 5 5 # second = 5
        # call proc
        call mimax

        # get result
        popmi1 5
        popmi2 5


    `)
){
    
console.log(c1.getProgmemByteString())
d.progmem=eval(c1.getProgmemByteString())


// do not sythesize
function runTicks(count){
    for(let i=0; i<count; i++){
        d.tick();
        // console.log('mem:', d.datamem)
        
        // console.log('mi1: ', d.mi1)
        // console.log('mi2: ',d.mi2)
        console.log('mem:', d.datamem)
        // console.log('ra:', d.ra)
    }
}

runTicks(100)
console.log('mem:', d.datamem)

console.log('mi1: ', d.mi1)
console.log('mi2: ',d.mi2)
// console.log('mem:', d.datamem)
console.log('ra:', d.ra)
}else
    console.log('error')

