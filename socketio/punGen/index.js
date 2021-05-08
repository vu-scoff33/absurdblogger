const TonedCharsExtraction = require('./Dictionary').TonedCharsExtraction;
const TonedChars = require('./Dictionary.js').TonedChars;
const PreConsonants = require("./Dictionary").PreConsonants;
const PostConsonants = require("./Dictionary").PostConsonants;
const LegalRhymes = require('./Dictionary').LegalRhymes;


var slicer = function(word){//a 2-chunk word
    var toned_chunks = word.split(' ');
    //untonify- first, since there are possible tones on preconsonants
    
    var pre = [];
    var post_vowels = [];
    var post_consonants = [];
    var tones = [];

    var chunks = toned_chunks.map(toned_chunk => {
        let newchunk = '';
        let tone = '-';
        for(let i = 0; i < toned_chunk.length; i++){
            if(TonedCharsExtraction[toned_chunk[i]] != null){
                let teencode = TonedCharsExtraction[toned_chunk[i]];
                tone = (teencode[1] == '-') ? tone : teencode[1];
                newchunk += teencode[0]
            }
            else{
                newchunk += toned_chunk[i]
            }
        }
        tones.push(tone)
        return newchunk;
    })
    //fencing
    chunks.forEach(function(chunk, index){
        let _fence1, _fence2;
        for(let i = 0; i < chunk.length; i++){
            if(_fence1 != null && _fence2 == null && !TonedCharsExtraction[chunk[i]]){
                _fence2 = i;
            }

            if(_fence1 == null && PreConsonants[chunk.substr(0, i+1)] == null){
                _fence1 = i;
            }
        }
        if(_fence2 == null)    _fence2 = chunk.length;
        pre.push(chunk.substr(0, _fence1));
        post_vowels.push(chunk.substr(_fence1, _fence2 - _fence1));
        post_consonants.push(chunk.substr(_fence2));
    })
    // console.log(pre)
    // console.log(post_vowels)
    // console.log(post_consonants)
    
    return {tones, post_vowels, post_consonants, pre};
}

var constructRhymes = function(vowels, consonants, tones){
    //always in pair, meaning there is possibly one case of pair containing two same values. 
    var _pair_rhymes = []; 
    let _first = validateRhyme(vowels[0], consonants[0], tones[0]);
    let _second = validateRhyme(vowels[1], consonants[1], tones[1]);
    if(_first.isPossible && _second.isPossible){
        _pair_rhymes.push({
            first: _first.value, 
            second: _second.value,
        })
    }
    //the original value is always available, so the results won't have to handle null value
    
    _first = validateRhyme(vowels[0], consonants[0], tones[1]);
    _second = validateRhyme(vowels[1], consonants[1], tones[0]);
    if(_first.isPossible && _second.isPossible){
        _pair_rhymes.push({
            first: _first.value, 
            second: _second.value,
        })
    }

   _first = validateRhyme(vowels[1], consonants[0], tones[0]);
   _second = validateRhyme(vowels[0], consonants[1], tones[1]);
   if(_first.isPossible && _second.isPossible){
    _pair_rhymes.push({
        first: _first.value, 
        second: _second.value,
    })
}

   _first = validateRhyme(vowels[1], consonants[0], tones[1]);
   _second = validateRhyme(vowels[0], consonants[1], tones[0]);
   if(_first.isPossible && _second.isPossible){
    _pair_rhymes.push({
        first: _first.value, 
        second: _second.value,
    })
}

  for(let i = 0 ; i < _pair_rhymes.length - 1; i++){
      for (let j = i + 1; j < _pair_rhymes.length; j++){
          if( (_pair_rhymes[i].first === _pair_rhymes[j].first && _pair_rhymes[i].second === _pair_rhymes[j].second)
            || (_pair_rhymes[i].first === _pair_rhymes[j].second && _pair_rhymes[i].second === _pair_rhymes[j].first)
            )
                _pair_rhymes[j].mark = true;
      }
  }
  for(let i = _pair_rhymes.length - 1; i >= 0; i--){
      if (_pair_rhymes[i].mark) _pair_rhymes.splice(i, 1)
  }
  return _pair_rhymes;
}


function preValidation(word){
    //$validate only the ruling of rhymes, refactor: validate prefixes' rule (ngh, k, etc)

    //loose slicing
    var toned_chunks = word.split(' ');
    var tones = [];
    var chunks = toned_chunks.map(toned_chunk => {
        let newchunk = '';
        let tone = '-';
        for(let i = 0; i < toned_chunk.length; i++){
            if(TonedCharsExtraction[toned_chunk[i]] != null){
                let teencode = TonedCharsExtraction[toned_chunk[i]];
                tone = (teencode[1] == '-') ? tone : teencode[1];
                newchunk += teencode[0]
            }
            else{
                newchunk += toned_chunk[i]
            }
        }
        tones.push(tone)
        return newchunk;
    })
    var pre = [];
    var post = [];
    chunks.forEach((chunk) => {
        let foundBreakpoint = false;
        for(let i = 0; i < chunk.length; i++){
            if(TonedCharsExtraction[chunk[i]] != null && PreConsonants[chunk.substr(0, i+1)] == null)
            {
                pre.push(chunk.substr(0, i));
                post.push(chunk.substr(i));
                foundBreakpoint = true;
                break;
            }
        }
        if(!foundBreakpoint){
            //no vowels detected, what kind of abominated word is this? 
            post.push('');
            pre.push(chunk)
        }
    })
    
    //loose exception bypass
    for(let i = 0; i < pre.length; i++){
        if(pre[i] == 'gi' && post[i] == '')   post[i] = 'i'
        if(pre[i] == 'gi' && post[i][0] == 'ê')    post[i] = 'i' + post[i]
    }
    console.log(pre)
    console.log(post)
    for(let i = 0; i < pre.length; i++){
        if(pre[i] !== '' && PreConsonants[pre[i]] == null)   return {isValid: false, reason: `Phụ Âm ${pre[i]} không tồn tại.`}
    }
    for(let i = 0; i < post.length; i++){
        if(post[i] == '')  return {isValid: false, reason: `Từ mất vần như chân mất guốc.`}
    }
    for(let i = 0; i < post.length; i++){
        if(LegalRhymes[post[i]] == null)    
            return {isValid: false, reason: `Vần ${post[i]} không tồn tại.`}
        if(LegalRhymes[post[i]] && LegalRhymes[post[i]].indexOf(tones[i]) == -1) 
            return {isValid: false, reason: `Vần ${post[i]} không đi với dấu ${tones[i]}`}
    }
    return {isValid: true}
}
var toningRule = function(vowel, consonant, tone){
    //all safe to tone post-validation
    if(vowel.indexOf('ê') !== -1){
        let tonedVowel = vowel.replace('ê', TonedChars[`ê${tone}`]);
        return  `${tonedVowel}${consonant}`;
    }
    if(vowel.indexOf('ơ') !== -1){
        let tonedVowel = vowel.replace('ơ', TonedChars[`ơ${tone}`]);
        return `${tonedVowel}${consonant}`;
    }
    if(vowel.length == 1){
        let tonedVowel = TonedChars[`${vowel}${tone}`];
        return `${tonedVowel}${consonant}`
    }
    if(vowel.length === 2 && consonant === ''){
        let tonedVowel = vowel.replace(vowel[0], TonedChars[`${vowel[0]}${tone}`] );
        return tonedVowel;
    }
    if(vowel.length === 2 && consonant !== ''){
        let tonedVowel = vowel.replace(vowel[1], TonedChars[`${vowel[1]}${tone}`] );
        return `${tonedVowel}${consonant}`;
    }
    if(vowel.length === 3){
        let tonedVowel = vowel.replace(vowel[1], TonedChars[`${vowel[1]}${tone}`] );
        return `${tonedVowel}${consonant}`;
    }
}

function validateRhyme(vowel, consonant, tone){
    let candidateRhyme = `${vowel}${consonant}`;
    if(LegalRhymes[candidateRhyme] == null)
        return {isPossible: false, reason: `${candidateRhyme} is not legal`};
    //nextphase
    let isTonable = true;
    if(LegalRhymes[candidateRhyme]) //beware of undefined
        isTonable = (LegalRhymes[candidateRhyme].indexOf(tone) !== -1);
    //toning
    if (!isTonable) return {isPossible: false, reason: `Post-consonant ${consonant} cannot be toned with ${tone}`}
    else return {isPossible: true, value: toningRule(vowel, consonant, tone)};
}

var PunGen = function(text){
    //only take 2-word text
    //tolowercase, 
    //basic sanitization? 
    text = text.trim().toLowerCase();
    //I can randomize & pass the array of toned-chunks into slicer right away
    let validity = preValidation(text);
    if(!validity.isValid)
        return validity;

    var {tones, post_vowels, post_consonants, pre} = slicer(text);
    handleExceptions(pre, post_vowels, "input")
    console.log(pre)
    console.log(post_vowels)
    console.log(post_consonants)
    console.log(tones)

    var pair_rhymes = constructRhymes(post_vowels, post_consonants, tones);
    var results = [];
    pair_rhymes.forEach(function(pair){
        //first pair
        let chunk_1 = pre[0] + pair.first; 
        let chunk_2 = pre[1] + pair.second;
        chunk_1 = handleExceptions(0, 0, "output", chunk_1);
        chunk_2 = handleExceptions(0, 0, "output", chunk_2)
        results.push(`${chunk_1} ${chunk_2}`);
        results.push(`${chunk_2} ${chunk_1}`);

        //second pair
        chunk_1 = pre[1] + pair.first;
        chunk_2 = pre[0] + pair.second;
        chunk_1 = handleExceptions(0, 0, "output", chunk_1);
        chunk_2 = handleExceptions(0, 0, "output", chunk_2)
        results.push(`${chunk_1} ${chunk_2}`);
        results.push(`${chunk_2} ${chunk_1}`);
    })
    results.sort()
    for(let i = results.length - 1; i > 0; i--){
        if(results[i] === results[i-1]) results.splice(i, 1)
    }
    return {isValid: true, results: results}
}


function handleExceptions(pre, post_vowels, currentPhase, fullchunk){
    //beware potential side effects (of mutating arguments)
    //(*)Adding another 'i' as part of post_vowels
    if(currentPhase === 'input'){
        for(let i = 0; i < pre.length; i++){
            if(pre[i] == 'gi' && post_vowels[i] == '')
                post_vowels[i] = 'i';
            if(pre[i] == 'gi' && post_vowels[i] == 'ê')
                post_vowels[i] = 'i' + post_vowels[i]
        }
    }
    if(currentPhase === 'output'){
        //since all tones are added to postfix, prefix is assuredly monotoned
        if(fullchunk.substr(0, 2) == 'gi' && TonedCharsExtraction[fullchunk[2]][0] == 'i')
            return fullchunk.replace('i', '');
        else return fullchunk;
    }
}

module.exports = PunGen;