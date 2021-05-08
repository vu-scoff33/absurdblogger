const TonedCharsExtraction = {
    'a' : "a-",
    'ă' : "ă-",
    'â' : "â-",
    'à' : 'a\\',
    'á' : "a/",
    'ã' : "a~",
    'ạ' : 'a.',
    'ằ' : 'ă\\',
    'ẵ' : 'ă~',
    'ặ' : 'ă.',
    'ắ' : 'ă/',
    'ầ' : 'â\\',
    'ấ' : 'â/',
    'ẫ' : 'â~',
    'ậ' : 'â.',
    'ả' : 'a?',
    'ẩ' : 'â?',
    'ẳ' : 'ă?',

    'e': 'e-',
    'è' : 'e\\',
    'é' : 'e/',
    'ẽ' : 'e~',
    'ẹ' : 'e.',
    'ê' : 'ê-',
    'ề' : 'ê\\',
    'ế' : 'ê/',
    'ễ' : 'ê~',
    'ệ' : 'ê.',
    'ể' : 'ê?',
    'ẻ' :'e?',

    'i' : 'i-',
    'ì' : 'i\\',
    'í' : 'i/',
    'ĩ' : 'i~',
    'ị' : 'i.',
    'ỉ' : 'i?',

    'u' : 'u-',
    'ư' : 'ư-',
    'ù' : 'ư\\',
    'ú' : 'u/',
    'ũ' : 'u~',
    'ụ' : 'u.',
    'ừ' : 'ư\\',
    'ứ' : 'ư/',
    'ữ' : 'ư~',
    'ự' : 'ư.',
    'ủ' : 'ư?',
    'ử' : 'ư?',

    'o' : 'o-',
    'ô' : 'ô-',
    'ò' : 'o\\',
    'ó' : 'o/',
    'õ' : 'o~',
    'ọ' : 'o.',
    'ồ' : 'ô\\',
    'ố' : 'ô/',
    'ỗ' : 'ô~',
    'ộ' : 'ô.',
    'ơ' : 'ơ-',
    'ờ' : 'ơ\\',
    'ớ' : 'ơ/',
    'ỡ' : 'ơ~',
    'ợ' : 'ơ.',
    'ổ' : 'ô?',
    'ỏ' : 'o?',
    'ở' : 'ơ?',

    'y' : 'y-',
    'ý' : 'y/',
    'ỷ' : 'y?',
    'ỵ' : 'y.',
    'ỳ' : 'y\\', 
    'ỹ' : 'y~',
}

const PostConsonants = {//restrictions
    'c': ['/', '.'],
    'ch': ['/', '.'],
    'm': false,
    'n': false,
    'nh': false,
    'ng' : false,
    'p' : ['/', '.'],
    't' : ['/', '.'],
}
const PreConsonants = {
    'b': '', 'c' : '', 'ch': '', 'd': '', 'đ':'', 'g': '', 'gh': '', 'gi': '',
    'h': '', 'k': '', 'kh': '', 'l': '', 'm': '', 'n': '', 'nh': '', 
    'ng': '', 'ngh': '', 'p': '', 'ph': '', 'qu': '', 'r': '', 's': '', 't': '', 'th': '',
    'tr': '', 'v': '', 'x': '', 'q' : '',

    //$$make exception mappings: c -> k, g -> gh, ng -> ngh
}

// const VowelsArr = ['a', 'â', 'ă', 'u', 'ư', 'ê', 'e', 'ô', 'o', 'ơ', 
// 'i', 'y', 'ai', 'ao', 'âu', 'ay', 'ây', 'eo', 'êu', 'ia', 'iê', 'yê', 'iu',
// 'oa', 'oă', 'oe', 'oi', 'ôi', 'ơi', 'oo', 'ua', 'ưa', 'uă', 'uâ', 'uê', 'ui',
// 'ưi', 'uo', 'uô', 'ôô', 'uơ', 'ươ', 'ưu', 'uy', 'iêu', 'yêu', 'oai', 'oao', 
// 'oeo', 'uao', 'uây', 'uôi', 'ươi', 'ươu', 'uya', 'uyê', 'uyu'
// ]


//Rhyme = vowels + postfixes (connectable? --> true all, false none --> some [requires a postfix?] )


const Vowels = {
    'a': true,
    'â': ['c', 'm', 'n', 'ng', 'p', 't'],
    'ă': ['c', 'm', 'n', 'ng', 'p', 't'],
    'u': ['', 'c', 'm', 'n', 'ng', 'p', 't'],
    'ư': ['','c', 'n', 'm', 'ng', 't'],
    'e': ['', 'c', 'm', 'n', 'ng', 'p', 't'],
    'ê' : ['', 'ch','m', 'n', 'nh', 'p', 't'],
    'o': ['', 'c', 'm', 'n', 'ng', 'p', 't'],
    'ô' : ['', 'c', 'm', 'n', 'ng', 'p', 't'],
    'ơ': ['', 'm', 'n', 'p', 't'],
    'y': false, //only standalone
    'i': ['', 'ch', 'm', 'n', 'p', 't', 'nh'],

    'eo': false,
    'ao': false,
    'ai': false,
    'ia': false,
    'au': false,
    'ay': false,
    'ây': false,
    'âu': false,
    'êu': false,
    'iu': false,
    'oi': false,
    'ôi': false, 
    'ơi': false,
    'ua': false,
    'ui': false,
    'uơ': false,
    'ưu': false,
    'ưi': false,
    'ưa': false,
    'oe' : ['', 'n', 't'],
    'oa': true,
    'oă': ['c', 'm', 'n', 'ng', 't', 'p'],
    'oo': ['c', 'ng'],
    'uâ': ['n', 'ng', 't'],
    'uê': ['', 'ch','nh'],
    'iê': ['c', 'm', 'n', 'ng', 'p', 't'],
    'uô': ['c', 'm', 'n', 'ng', 't'], 
    'uy': ['', 'ch', 'nh', 'n', 'p', 't'],
    'ươ': ['c', 'm', 'n', 'ng', 'p', 't'],
    'yê': ['m', 'n', 't', 'ng'],

    'iêu': false,
    'oai': false,
    'oao': false, 
    'oay': false,
    'oeo': false,
    'uây': false,
    'uôi': false,
    'uya': false, 
    'uyê': ['n', 't'],
    'uyu': false, 
    'ươi': false,
    'ươu': false, 
    'yêu': false,
}

var raw = [
    'a', 'ach', 'ai', 'am', 'ac', 'an', 'ang', 'anh', 'ao', 'ap', 'at', 'ay',
    'au', 'ă', 'ăc', 'ăm', 'ăn', 'ăng', 'ăp', 'ăt', 'â', 'âc', 'âm', 'ân', 'âng',
    'âp', 'ât', 'âu', 'ây', 'e', 'ec', 'em', 'en', 'eng', 'eo', 'ep', 'et',
    'ê', 'êch', 'êm', 'ên', 'ênh', 'êp', 'êt', 'êu', 'i', 'ia', 'ich', 'iêc', 
    'iêm', 'iên', 'iêng', 'iêp', 'iêt', 'iêu', 'im', 'in', 'inh', 'ip', 'it',
    'iu', 'o', 'oa', 'oac', 'oach', 'oai', 'oam', 'oan', 'oang', 'oanh','oao',
    'oap', 'oat', 'oay', 'oăc', 'oăm', 'oăn', 'oăng', 'oăt', 'oe', 'oc', 
    'oen', 'oeo', 'oet', 'oi', 'om', 'on', 'ong', 'ooc', 'oong', 'op', 'ot', 
    'ô', 'ôc', 'ôi', 'ôm', 'ôn', 'ông', 'ôp', 'ôt', 'ơ', 'ơi', 'ơm', 'ơn',
    'ơp', 'ơt', 'u', 'ua', 'uân', 'uâng', 'uât', 'uây', 'uc', 'uê', 'uêch', 'uênh',
    'ui', 'um', 'un', 'ung', 'uơ', 'uôc', 'uôi', 'uôm', 'uôn', 'uông', 'uôt', 
    'up', 'ut', 'uy', 'uya', 'uych', 'uyên', 'uyêt', 'uyn', 'uynh', 'uyp', 
    'uyt', 'uyu', 'ư', 'ưa', 'ưc', 'ưi', 'ưng', 'ươc', 'ươi', 'ươm', 'ươn',
    'ương',  'ươp', 'ươt', 'ươu', 'ưt', 'ưu', 'y', 'yêm', 'yên', 'yêng',
    'yêt', 'yêu'
]

var constructRhymes = function(){
    let legalRhymes = {}
    let post_consonants_arr = Object.keys(PostConsonants);
    
    Object.keys(Vowels).forEach(function(vowel){
        if(Vowels[vowel] == true){
            legalRhymes[vowel] = false;
            for(let i = 0; i < post_consonants_arr.length; i++){
                legalRhymes[`${vowel}${post_consonants_arr[i]}`] = PostConsonants[post_consonants_arr[i]]
            }
        }
        else if(Vowels[vowel] == false)
            legalRhymes[vowel] = false;
        else{

            for(let i = 0; i < Vowels[vowel].length; i++){
                if(i == 0 && Vowels[vowel][i] == '')    legalRhymes[vowel] = false;
                else
                    legalRhymes[`${vowel}${Vowels[vowel][i]}`] = PostConsonants[Vowels[vowel][i]];
            }
        }
    })
    return legalRhymes;
}


function composeTonedChars(){
    var tonedChars = {};
    Object.keys(TonedCharsExtraction).forEach(function(key){
        let value = TonedCharsExtraction[key];
        tonedChars[value] = key;
    })
    return tonedChars;
}

module.exports = {
    TonedCharsExtraction: TonedCharsExtraction,
    TonedChars: composeTonedChars(),
    PreConsonants: PreConsonants,
    LegalRhymes: constructRhymes()
}