const rne = new RussianNouns.Engine()
const Gender = RussianNouns.Gender
const Case = RussianNouns.Case

let dict = {}
let isRussianToMurin = true

async function loadDictionary() {
    await new Promise(resolve => {
        if (typeof supabaseClient !== 'undefined') return resolve()
        const i = setInterval(() => { if (typeof supabaseClient !== 'undefined') { clearInterval(i); resolve() } }, 50)
    })

    const { data } = await supabaseClient
        .from('dictionary')
        .select('russian, murino')
        .eq('status', 'approved')

    if (data) {
        data.forEach(({ russian, murino }) => {
            dict[russian.toLowerCase().trim()] = murino.toLowerCase().trim()
        })
    }
}

function detectGender(word) {
    const w = word.toLowerCase()
    if (w.endsWith('ия') || w.endsWith('ья') || w.endsWith('а')) return Gender.FEMININE
    if (w.endsWith('ие') || w.endsWith('ье') || w.endsWith('о') || w.endsWith('е')) return Gender.NEUTER
    return Gender.MASCULINE
}

function detectCase(word, baseForm) {
    const w = word.toLowerCase()
    const gender = detectGender(baseForm)
    const lemma = RussianNouns.createLemma({ text: baseForm, gender })

    for (const c of RussianNouns.CASES) {
        const forms = rne.decline(lemma, c)
        if (forms.includes(w)) return { case: c, plural: false }
    }

    const pluralForm = rne.pluralize(lemma)[0]
    if (pluralForm) {
        for (const c of RussianNouns.CASES) {
            const forms = rne.decline(lemma, c, pluralForm)
            if (forms.includes(w)) return { case: c, plural: true }
        }
    }

    return null
}

function applyMurinoForm(murinoBase, detectedForm) {
    if (!detectedForm) return murinoBase

    const gender = detectGender(murinoBase)
    const lemma = RussianNouns.createLemma({ text: murinoBase, gender })

    if (detectedForm.plural) {
        const pluralForm = rne.pluralize(lemma)[0]
        if (!pluralForm) return murinoBase
        const forms = rne.decline(lemma, detectedForm.case, pluralForm)
        return forms[0] ?? murinoBase
    } else {
        const forms = rne.decline(lemma, detectedForm.case)
        return forms[0] ?? murinoBase
    }
}

function applyCase(original, translated) {
    if (!original || !translated) return translated
    if (original[0] === original[0].toUpperCase() && original[0] !== original[0].toLowerCase()) {
        return translated.charAt(0).toUpperCase() + translated.slice(1)
    }
    return translated
}

function isNoun(word) {
    const w = word.toLowerCase()
    const nounEndings = ['ость', 'ение', 'ание', 'ство', 'тель', 'ник', 'щик', 'ист', 'ор', 'ер',
        'а', 'я', 'о', 'е', 'ь', 'й']
    const verbEndings = ['ть', 'ти', 'чь', 'ет', 'ит', 'ат', 'ют', 'ут', 'ешь', 'ишь', 'ал', 'ила', 'ыть']
    const adjEndings = ['ый', 'ий', 'ой', 'ая', 'яя', 'ое', 'ее', 'ые', 'ие']

    for (const e of verbEndings) if (w.endsWith(e)) return false
    for (const e of adjEndings) if (w.endsWith(e)) return false
    for (const e of nounEndings) if (w.endsWith(e)) return true
    return w.length > 3
}

function translateWord(word) {
    const clean = word.toLowerCase().trim()
    if (!clean || clean.length <= 2) return word

    if (dict[clean]) return applyCase(word, dict[clean])

    for (const [base, murinoBase] of Object.entries(dict)) {
        const detectedForm = detectCase(clean, base)
        if (detectedForm) {
            const result = applyMurinoForm(murinoBase, detectedForm)
            return applyCase(word, result)
        }
    }

    if (!isNoun(clean)) return word

    if (clean.length > 9) return applyCase(word, clean.substring(0, 6) + 'л')
    const base = clean.replace(/[аеёиоуыюяь]+$/, '')
    return applyCase(word, base + 'ость')
}

function translate() {
    const source = document.getElementById('sourceText').value
    if (!source.trim()) { document.getElementById('targetText').innerText = ''; return }

    const parts = source.split(/(\s+|[,.!?;:—()\[\]])/)
    const result = parts.map(part => {
        if (/^\s+$/.test(part) || /[,.!?;:—()\[\]]/.test(part)) return part
        return translateWord(part)
    })

    document.getElementById('targetText').innerText = result.join('')
}

function swapLanguages() {
    const current = document.getElementById('targetText').innerText
    isRussianToMurin = !isRussianToMurin
    document.getElementById('leftLangName').innerText = isRussianToMurin ? 'Русский' : 'Муринскч'
    document.getElementById('rightLangName').innerText = isRussianToMurin ? 'Муринскч' : 'Русский'
    if (current) document.getElementById('sourceText').value = current
    translate()
}

document.getElementById('sourceText').addEventListener('input', translate)

loadDictionary().then(() => translate())
