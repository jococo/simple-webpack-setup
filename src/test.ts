
import "mocha";
import {expect} from "chai";
import {forth, Context, createEmptyContext} from "./sallied-forth";

let testForth = (input:string) => {
    return forth(input, createEmptyContext());
}

describe('forth interpreter command', ()=> {
    describe('string handling', ()=> {
        it('BL adds 32 to the stack', ()=> {
            expect(testForth('BL')).to.have.property('stack').to.eql([32]);
        })
        // it('allows direct string inlining', ()=> {
        //     expect(
        //         testForth('s" ABC " type')
        //     )
        //     .to.have.property('stdout')
        //     .that.equals('ABC ')
        // })
    })
    describe('parser', ()=> {
        it('copes with single spaces', () => {
            expect(testForth("99 .")).to.have.property('stdout').that.equals("99 ");
        })
        it('copes with multiple spaces', () => {
            expect(testForth('99      1    + .')).to.have.property('stdout').that.equals('100 ');
        })
        it('copes with other whitespace', () => {
            expect(testForth(`23
             7
                +   .`).stdout).to.equal('30 ');
        })
        // it('handles strings', () => {
        //     expect(testForth('s" ABC " .')).to.have.property('stdout').that.eqls('DANG!');
        // })
    })
    describe('main stack', ()=> {
        describe('push and pop', ()=> {
            it('. returns a result object', ()=> {
                expect(testForth("12 .")).to.be.an('object');
            })
            it('. returns a value in the result object', ()=> {
                expect(testForth("99 .").stdout).to.equal('99 ');
            })
            it('. throws an error when stack is empty', ()=> {
                expect(()=> testForth(".")).to.throw(Error, 'Stack underflow!');
            })
        })
        describe('querying', ()=> {
            it('.s displays the content of the stack', () => {
                expect(testForth("99 11 1001 .s").stdout).to.equal("99 11 1001 ");
            })
            it('.s displays Empty when the stack is empty', () => {
                expect(testForth(".s").stdout).to.equal("Empty ");
            })
        })
        describe('stack manipulation methods', ()=> {
            it('duplicates the top of the stack with dup', () => {
                expect(testForth('98 dup').stack.length).to.equal(2);
            })
            it('duplicates the second item on the stack and places it on the top with over', () => {
                expect(testForth('99 66 over').stack).to.eql([99, 66, 99]);
            })
            it('drops the top of the stack with drop', () => {
                expect(testForth('97 drop').stack.length).to.equal(0);
            })
            it('picks the third item off the stack and place it first with rot', () => {
                expect(testForth('10 20 30 rot').stack).to.eql([20, 30, 10]);
            })
            it('picks the first item off the stack and place it third with -rot', () => {
                expect(testForth('10 20 30 -rot').stack).to.eql([30, 10, 20]);
            })
            it('drops the top two items on the stack with 2drop', () => {
                expect(testForth('1 10 2drop').stack).to.eql([]);
            })
            it('swaps the top two items on the stack with swap', () => {
                expect(testForth('1 10 swap').stack).to.eql([10, 1]);
            })
            it('drop the second item on the stack with nip', () => {
                expect(testForth('1 10 nip').stack).to.eql([10]);
            })
            it('(a b -- b a b) with tuck', () => {
                expect(testForth('1 10 tuck').stack).to.eql([10, 1, 10]);
            })
        })
    })
    describe('math methods', ()=> {
        it('adds the top two stack items with +', () => {
            expect(testForth('10 21 + .').stdout).to.equal('31 ');
        })
        it('subtracts the 2nd stack item from the 1st stack item with -', () => {
            expect(testForth('100 12 - .').stdout).to.equal('88 ');
        })
        it('multiplies the top two stack items with *', () => {
            expect(testForth('4 7 * .').stdout).to.equal('28 ');
        })
        it('can accept values in binary number base', () => {
            expect(testForth('2 base 1001 11 + .').stdout).to.equal('1100 ');
        })
        it('can accept numbers in hexadecimal', () => {
            expect(testForth('hex ff 4 - .').stdout).to.equal('fb ');
        })
        it('can switch between hexadecimal and decimal', () => {
            expect(testForth('hex ff decimal 40 - .').stdout).to.equal('215 ');
        })
    })
})