-- JLPT Master Platform - Seed Data
-- Real JLPT vocabulary, kanji, grammar, theory, and exam questions

-- ─────────────────────────────────────────────
-- VOCABULARY - N5 (20 words)
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO vocabulary (kanji, kana, furigana, meaning_es, meaning_en, level, category, frequency, examples) VALUES
('水',   'みず',     'みず',     'agua',             'water',         'N5', 'sustantivo', 100, '[{"jp":"水を飲みます。","rom":"Mizu o nomimasu.","es":"Bebo agua."},{"jp":"水が冷たいです。","rom":"Mizu ga tsumetai desu.","es":"El agua está fría."}]'),
('山',   'やま',     'やま',     'montaña',          'mountain',      'N5', 'sustantivo', 90,  '[{"jp":"あの山は高いです。","rom":"Ano yama wa takai desu.","es":"Esa montaña es alta."}]'),
('先生', 'せんせい', 'せんせい', 'profesor/a',       'teacher',       'N5', 'sustantivo', 95,  '[{"jp":"先生はどこですか。","rom":"Sensei wa doko desu ka.","es":"¿Dónde está el profesor?"}]'),
('学校', 'がっこう', 'がっこう', 'escuela',          'school',        'N5', 'sustantivo', 93,  '[{"jp":"学校に行きます。","rom":"Gakkou ni ikimasu.","es":"Voy a la escuela."}]'),
('食べる','たべる',  'たべる',   'comer',            'to eat',        'N5', 'verbo',      98,  '[{"jp":"朝ごはんを食べます。","rom":"Asagohan o tabemasu.","es":"Como el desayuno."}]'),
('飲む', 'のむ',     'のむ',     'beber',            'to drink',      'N5', 'verbo',      97,  '[{"jp":"コーヒーを飲みます。","rom":"Koohii o nomimasu.","es":"Bebo café."}]'),
('見る', 'みる',     'みる',     'ver / mirar',      'to see/watch',  'N5', 'verbo',      99,  '[{"jp":"映画を見ます。","rom":"Eiga o mimasu.","es":"Veo una película."}]'),
('今日', 'きょう',   'きょう',   'hoy',              'today',         'N5', 'sustantivo', 100, '[{"jp":"今日は月曜日です。","rom":"Kyou wa getsuyoubi desu.","es":"Hoy es lunes."}]'),
('大きい','おおきい','おおきい', 'grande',           'big/large',     'N5', 'adjetivo',   96,  '[{"jp":"大きい犬がいます。","rom":"Ookii inu ga imasu.","es":"Hay un perro grande."}]'),
('小さい','ちいさい','ちいさい', 'pequeño/a',        'small/little',  'N5', 'adjetivo',   95,  '[{"jp":"小さい猫です。","rom":"Chiisai neko desu.","es":"Es un gato pequeño."}]'),
('高い', 'たかい',   'たかい',   'alto / caro',      'tall/expensive','N5', 'adjetivo',   94,  '[{"jp":"あのビルは高いです。","rom":"Ano biru wa takai desu.","es":"Ese edificio es alto."}]'),
('安い', 'やすい',   'やすい',   'barato/a',         'cheap',         'N5', 'adjetivo',   93,  '[{"jp":"このりんごは安いです。","rom":"Kono ringo wa yasui desu.","es":"Esta manzana es barata."}]'),
('電車', 'でんしゃ', 'でんしゃ', 'tren',             'train',         'N5', 'sustantivo', 88,  '[{"jp":"電車で行きます。","rom":"Densha de ikimasu.","es":"Voy en tren."}]'),
('友達', 'ともだち', 'ともだち', 'amigo/a',          'friend',        'N5', 'sustantivo', 95,  '[{"jp":"友達と遊びます。","rom":"Tomodachi to asobimasu.","es":"Juego con amigos."}]'),
('時間', 'じかん',   'じかん',   'tiempo / hora',    'time/hour',     'N5', 'sustantivo', 97,  '[{"jp":"時間がありません。","rom":"Jikan ga arimasen.","es":"No tengo tiempo."}]'),
('読む', 'よむ',     'よむ',     'leer',             'to read',       'N5', 'verbo',      92,  '[{"jp":"本を読みます。","rom":"Hon o yomimasu.","es":"Leo un libro."}]'),
('書く', 'かく',     'かく',     'escribir',         'to write',      'N5', 'verbo',      90,  '[{"jp":"手紙を書きます。","rom":"Tegami o kakimasu.","es":"Escribo una carta."}]'),
('来る', 'くる',     'くる',     'venir',            'to come',       'N5', 'verbo',      99,  '[{"jp":"友達が来ます。","rom":"Tomodachi ga kimasu.","es":"Viene un amigo."}]'),
('行く', 'いく',     'いく',     'ir',               'to go',         'N5', 'verbo',      99,  '[{"jp":"学校に行きます。","rom":"Gakkou ni ikimasu.","es":"Voy a la escuela."}]'),
('話す', 'はなす',   'はなす',   'hablar',           'to speak',      'N5', 'verbo',      96,  '[{"jp":"日本語を話します。","rom":"Nihongo o hanashimasu.","es":"Hablo japonés."}]');

-- ─────────────────────────────────────────────
-- VOCABULARY - N4 (20 words)
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO vocabulary (kanji, kana, furigana, meaning_es, meaning_en, level, category, frequency, examples) VALUES
('経験',   'けいけん',   'けいけん',   'experiencia',      'experience',     'N4', 'sustantivo', 85, '[{"jp":"経験が大切です。","rom":"Keiken ga taisetsu desu.","es":"La experiencia es importante."}]'),
('文化',   'ぶんか',     'ぶんか',     'cultura',          'culture',        'N4', 'sustantivo', 83, '[{"jp":"日本の文化が好きです。","rom":"Nihon no bunka ga suki desu.","es":"Me gusta la cultura japonesa."}]'),
('残念',   'ざんねん',   'ざんねん',   'lástima / pena',   'regrettable',    'N4', 'adjetivo',   87, '[{"jp":"残念ですね。","rom":"Zannen desu ne.","es":"Qué lástima."}]'),
('確認する','かくにんする','かくにんする','confirmar',        'to confirm',     'N4', 'verbo',      80, '[{"jp":"内容を確認します。","rom":"Naiyou o kakunin shimasu.","es":"Confirmo el contenido."}]'),
('決める', 'きめる',     'きめる',     'decidir',          'to decide',      'N4', 'verbo',      88, '[{"jp":"計画を決めます。","rom":"Keikaku o kimemasu.","es":"Decido el plan."}]'),
('集める', 'あつめる',   'あつめる',   'recopilar / juntar','to collect',     'N4', 'verbo',      78, '[{"jp":"情報を集めます。","rom":"Jouhou o atsumemasu.","es":"Recopilo información."}]'),
('続ける', 'つづける',   'つづける',   'continuar',        'to continue',    'N4', 'verbo',      85, '[{"jp":"勉強を続けます。","rom":"Benkyou o tsuzukemasu.","es":"Continúo estudiando."}]'),
('比べる', 'くらべる',   'くらべる',   'comparar',         'to compare',     'N4', 'verbo',      77, '[{"jp":"価格を比べます。","rom":"Kakaku o kurabemasu.","es":"Comparo precios."}]'),
('調べる', 'しらべる',   'しらべる',   'investigar',       'to research',    'N4', 'verbo',      82, '[{"jp":"意味を調べます。","rom":"Imi o shirabemasu.","es":"Investigo el significado."}]'),
('連絡する','れんらくする','れんらくする','contactar',        'to contact',     'N4', 'verbo',      84, '[{"jp":"後で連絡します。","rom":"Ato de renraku shimasu.","es":"Te contacto después."}]'),
('説明する','せつめいする','せつめいする','explicar',         'to explain',     'N4', 'verbo',      83, '[{"jp":"詳しく説明します。","rom":"Kuwashiku setsumei shimasu.","es":"Explico en detalle."}]'),
('心配する','しんぱいする','しんぱいする','preocuparse',      'to worry',       'N4', 'verbo',      86, '[{"jp":"心配しないでください。","rom":"Shinpai shinaide kudasai.","es":"No te preocupes."}]'),
('予約',   'よやく',     'よやく',     'reservación',      'reservation',    'N4', 'sustantivo', 81, '[{"jp":"席を予約しました。","rom":"Seki o yoyaku shimashita.","es":"Hice una reservación."}]'),
('予定',   'よてい',     'よてい',     'plan / agenda',    'schedule',       'N4', 'sustantivo', 86, '[{"jp":"明日の予定は？","rom":"Ashita no yotei wa?","es":"¿Cuál es el plan de mañana?"}]'),
('方法',   'ほうほう',   'ほうほう',   'método / forma',   'method/way',     'N4', 'sustantivo', 84, '[{"jp":"別の方法を試します。","rom":"Betsu no houhou o tameshimasu.","es":"Pruebo otro método."}]'),
('場合',   'ばあい',     'ばあい',     'caso / situación', 'case/situation', 'N4', 'sustantivo', 87, '[{"jp":"その場合は連絡してください。","rom":"Sono baai wa renraku shite kudasai.","es":"En ese caso, contáctame."}]'),
('気持ち', 'きもち',     'きもち',     'sentimiento',      'feeling',        'N4', 'sustantivo', 89, '[{"jp":"気持ちを伝えます。","rom":"Kimochi o tsutaemasu.","es":"Transmito mis sentimientos."}]'),
('意味',   'いみ',       'いみ',       'significado',      'meaning',        'N4', 'sustantivo', 90, '[{"jp":"この言葉の意味は？","rom":"Kono kotoba no imi wa?","es":"¿Cuál es el significado de esta palabra?"}]'),
('理由',   'りゆう',     'りゆう',     'razón / motivo',   'reason',         'N4', 'sustantivo', 85, '[{"jp":"理由を教えてください。","rom":"Riyuu o oshiete kudasai.","es":"Dime la razón."}]'),
('可能',   'かのう',     'かのう',     'posible',          'possible',       'N4', 'adjetivo',   82, '[{"jp":"それは可能ですか。","rom":"Sore wa kanou desu ka.","es":"¿Es eso posible?"}]');

-- ─────────────────────────────────────────────
-- VOCABULARY - N3 (20 words)
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO vocabulary (kanji, kana, furigana, meaning_es, meaning_en, level, category, frequency, examples) VALUES
('影響',   'えいきょう', 'えいきょう', 'influencia',       'influence',      'N3', 'sustantivo', 78, '[{"jp":"環境に影響を与えます。","rom":"Kankyou ni eikyou o ataemasu.","es":"Influye en el entorno."}]'),
('意見',   'いけん',     'いけん',     'opinión',          'opinion',        'N3', 'sustantivo', 82, '[{"jp":"意見を述べます。","rom":"Iken o nobemasu.","es":"Expreso mi opinión."}]'),
('可能性', 'かのうせい', 'かのうせい', 'posibilidad',      'possibility',    'N3', 'sustantivo', 76, '[{"jp":"可能性は低いです。","rom":"Kanousei wa hikui desu.","es":"La posibilidad es baja."}]'),
('状況',   'じょうきょう','じょうきょう','situación',        'situation',      'N3', 'sustantivo', 79, '[{"jp":"状況を確認します。","rom":"Joukyou o kakunin shimasu.","es":"Confirmo la situación."}]'),
('判断',   'はんだん',   'はんだん',   'juicio / decisión','judgment',       'N3', 'sustantivo', 77, '[{"jp":"自分で判断してください。","rom":"Jibun de handan shite kudasai.","es":"Juzga por ti mismo."}]'),
('役割',   'やくわり',   'やくわり',   'papel / función',  'role',           'N3', 'sustantivo', 74, '[{"jp":"重要な役割を果たす。","rom":"Juuyou na yakuwari o hatasu.","es":"Desempeña un papel importante."}]'),
('目標',   'もくひょう', 'もくひょう', 'objetivo / meta',  'goal/target',    'N3', 'sustantivo', 81, '[{"jp":"目標を達成しました。","rom":"Mokuhyou o tassei shimashita.","es":"Alcancé el objetivo."}]'),
('議論する','ぎろんする', 'ぎろんする', 'debatir',          'to debate',      'N3', 'verbo',      72, '[{"jp":"この問題について議論します。","rom":"Kono mondai ni tsuite giron shimasu.","es":"Debatimos sobre este problema."}]'),
('解決する','かいけつする','かいけつする','resolver',         'to solve',       'N3', 'verbo',      79, '[{"jp":"問題を解決します。","rom":"Mondai o kaiketsu shimasu.","es":"Resuelvo el problema."}]'),
('評価する','ひょうかする','ひょうかする','evaluar',          'to evaluate',    'N3', 'verbo',      75, '[{"jp":"結果を評価します。","rom":"Kekka o hyouka shimasu.","es":"Evalúo los resultados."}]'),
('注目する','ちゅうもくする','ちゅうもくする','prestar atención','to pay attention','N3','verbo',   73, '[{"jp":"この点に注目します。","rom":"Kono ten ni chuumoku shimasu.","es":"Presto atención a este punto."}]'),
('対応する','たいおうする','たいおうする','responder / atender','to respond',   'N3', 'verbo',      76, '[{"jp":"問題に対応します。","rom":"Mondai ni taiou shimasu.","es":"Respondo al problema."}]'),
('期待',   'きたい',     'きたい',     'expectativa',      'expectation',    'N3', 'sustantivo', 80, '[{"jp":"期待に応えます。","rom":"Kitai ni kotaemasu.","es":"Cumplo con las expectativas."}]'),
('要求',   'ようきゅう', 'ようきゅう', 'exigencia / demanda','demand/request','N3', 'sustantivo', 71, '[{"jp":"要求を満たします。","rom":"Youkyuu o mitashimasu.","es":"Satisfago la demanda."}]'),
('程度',   'ていど',     'ていど',     'grado / nivel',    'degree/level',   'N3', 'sustantivo', 74, '[{"jp":"ある程度は理解できます。","rom":"Aru teido wa rikai dekimasu.","es":"Puedo entender hasta cierto punto."}]'),
('変化',   'へんか',     'へんか',     'cambio',           'change',         'N3', 'sustantivo', 78, '[{"jp":"大きな変化がありました。","rom":"Ookina henka ga arimashita.","es":"Hubo un gran cambio."}]'),
('確かに', 'たしかに',   'たしかに',   'ciertamente',      'certainly',      'N3', 'adverbio',   77, '[{"jp":"確かにそうですね。","rom":"Tashika ni sou desu ne.","es":"Ciertamente es así."}]'),
('一方',   'いっぽう',   'いっぽう',   'por otro lado',    'on the other hand','N3','adverbio',   75, '[{"jp":"一方、課題もあります。","rom":"Ippou, kadai mo arimasu.","es":"Por otro lado, también hay problemas."}]'),
('以上',   'いじょう',   'いじょう',   'más de / o más',   'more than/above','N3', 'sustantivo', 80, '[{"jp":"10人以上が参加した。","rom":"Juunin ijou ga sanka shita.","es":"Participaron 10 personas o más."}]'),
('以下',   'いか',       'いか',       'menos de / o menos','less than/below','N3','sustantivo', 78, '[{"jp":"18歳以下は入れません。","rom":"Juuhassai ika wa hairemasen.","es":"Los menores de 18 no pueden entrar."}]');

-- ─────────────────────────────────────────────
-- VOCABULARY - N2 (15 words)
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO vocabulary (kanji, kana, furigana, meaning_es, meaning_en, level, category, frequency, examples) VALUES
('概念',   'がいねん',   'がいねん',   'concepto',         'concept',        'N2', 'sustantivo', 68, '[{"jp":"抽象的な概念です。","rom":"Chuushouteki na gainen desu.","es":"Es un concepto abstracto."}]'),
('傾向',   'けいこう',   'けいこう',   'tendencia',        'tendency',       'N2', 'sustantivo', 70, '[{"jp":"増加の傾向があります。","rom":"Zouka no keikou ga arimasu.","es":"Hay una tendencia al aumento."}]'),
('根拠',   'こんきょ',   'こんきょ',   'fundamento / base','basis/grounds',  'N2', 'sustantivo', 65, '[{"jp":"根拠のある主張です。","rom":"Konkyo no aru shuchou desu.","es":"Es una afirmación fundamentada."}]'),
('手段',   'しゅだん',   'しゅだん',   'medio / herramienta','means/method',  'N2', 'sustantivo', 69, '[{"jp":"目的のための手段です。","rom":"Mokuteki no tame no shudan desu.","es":"Es un medio para el fin."}]'),
('特徴',   'とくちょう', 'とくちょう', 'característica',   'characteristic', 'N2', 'sustantivo', 72, '[{"jp":"この製品の特徴は何ですか。","rom":"Kono seihin no tokucho wa nan desu ka.","es":"¿Cuál es la característica de este producto?"}]'),
('把握する','はあくする', 'はあくする', 'comprender / captar','to grasp',      'N2', 'verbo',      67, '[{"jp":"状況を把握します。","rom":"Joukyou o haaku shimasu.","es":"Comprendo la situación."}]'),
('実施する','じっしする', 'じっしする', 'implementar',      'to implement',   'N2', 'verbo',      69, '[{"jp":"計画を実施します。","rom":"Keikaku o jisshi shimasu.","es":"Implemento el plan."}]'),
('促進する','そくしんする','そくしんする','promover',         'to promote',     'N2', 'verbo',      64, '[{"jp":"経済発展を促進します。","rom":"Keizai hatten o sokushin shimasu.","es":"Promuevo el desarrollo económico."}]'),
('検討する','けんとうする','けんとうする','considerar / examinar','to consider', 'N2', 'verbo',      73, '[{"jp":"問題を検討します。","rom":"Mondai o kentou shimasu.","es":"Considero el problema."}]'),
('維持する','いじする',   'いじする',   'mantener',         'to maintain',    'N2', 'verbo',      68, '[{"jp":"品質を維持します。","rom":"Hinshitsu o iji shimasu.","es":"Mantengo la calidad."}]'),
('整備する','せいびする', 'せいびする', 'preparar / equipar','to equip',       'N2', 'verbo',      62, '[{"jp":"環境を整備します。","rom":"Kankyou o seibi shimasu.","es":"Preparo el entorno."}]'),
('従来',   'じゅうらい', 'じゅうらい', 'tradicional / hasta ahora','traditional','N2','adjetivo',  66, '[{"jp":"従来の方法を変えます。","rom":"Juurai no houhou o kaemasu.","es":"Cambio el método tradicional."}]'),
('相互',   'そうご',     'そうご',     'mutuo / recíproco','mutual',         'N2', 'adjetivo',   61, '[{"jp":"相互理解が大切です。","rom":"Sougo rikai ga taisetsu desu.","es":"El entendimiento mutuo es importante."}]'),
('最終的', 'さいしゅうてき','さいしゅうてき','finalmente',    'ultimately',     'N2', 'adverbio',   71, '[{"jp":"最終的に合意しました。","rom":"Saishuu teki ni goui shimashita.","es":"Finalmente llegamos a un acuerdo."}]'),
('詳細',   'しょうさい', 'しょうさい', 'detalles',         'details',        'N2', 'sustantivo', 69, '[{"jp":"詳細を確認してください。","rom":"Shousai o kakunin shite kudasai.","es":"Revisa los detalles."}]');

-- ─────────────────────────────────────────────
-- VOCABULARY - N1 (15 words)
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO vocabulary (kanji, kana, furigana, meaning_es, meaning_en, level, category, frequency, examples) VALUES
('懸念',   'けねん',     'けねん',     'preocupación / inquietud','concern',   'N1', 'sustantivo', 55, '[{"jp":"環境問題への懸念が高まっています。","rom":"Kankyou mondai e no kenen ga takamatte imasu.","es":"La preocupación por los problemas ambientales está aumentando."}]'),
('膨大',   'ぼうだい',   'ぼうだい',   'enorme / vasto',   'enormous',       'N1', 'adjetivo',   52, '[{"jp":"膨大なデータを処理します。","rom":"Boudai na deeta o shori shimasu.","es":"Proceso una cantidad enorme de datos."}]'),
('顕著',   'けんちょ',   'けんちょ',   'notable / marcado','remarkable',     'N1', 'adjetivo',   50, '[{"jp":"顕著な改善が見られます。","rom":"Kencho na kaizen ga miraremasu.","es":"Se observa una mejora notable."}]'),
('慎重',   'しんちょう', 'しんちょう', 'cauteloso / prudente','cautious',     'N1', 'adjetivo',   57, '[{"jp":"慎重に判断してください。","rom":"Shinchou ni handan shite kudasai.","es":"Juzga con cautela."}]'),
('汎用',   'はんよう',   'はんよう',   'de uso general',   'general-purpose','N1', 'adjetivo',   48, '[{"jp":"汎用システムを開発します。","rom":"Hanyou shisutemu o kaihatsu shimasu.","es":"Desarrollo un sistema de uso general."}]'),
('払拭する','ふっしょくする','ふっしょくする','disipar / eliminar','to dispel',  'N1', 'verbo',      45, '[{"jp":"不安を払拭します。","rom":"Fuan o fusshoku shimasu.","es":"Disipo la ansiedad."}]'),
('俯瞰する','ふかんする', 'ふかんする', 'ver desde arriba / panoramizar','to view from above','N1','verbo',42,'[{"jp":"全体を俯瞰して考えます。","rom":"Zentai o fukan shite kangaemasu.","es":"Pienso con una visión panorámica."}]'),
('凌駕する','りょうがする','りょうがする','superar / exceder','to surpass',    'N1', 'verbo',      40, '[{"jp":"予想を凌駕する結果です。","rom":"Yosou o ryouga suru kekka desu.","es":"Es un resultado que supera las expectativas."}]'),
('醸成する','じょうせいする','じょうせいする','cultivar / fomentar','to foster', 'N1', 'verbo',     38, '[{"jp":"信頼関係を醸成します。","rom":"Shinrai kankei o jousei shimasu.","es":"Fomento una relación de confianza."}]'),
('斟酌する','しんしゃくする','しんしゃくする','considerar / tener en cuenta','to consider carefully','N1','verbo',35,'[{"jp":"事情を斟酌します。","rom":"Jijou o shinshaku shimasu.","es":"Considero las circunstancias cuidadosamente."}]'),
('暫定的', 'ざんていてき','ざんていてき','provisional / temporal','provisional', 'N1', 'adjetivo',   49, '[{"jp":"暫定的な措置です。","rom":"Zantei teki na sochi desu.","es":"Es una medida provisional."}]'),
('熟慮',   'じゅくりょ', 'じゅくりょ', 'reflexión profunda','deliberation',  'N1', 'sustantivo', 46, '[{"jp":"熟慮の末、決断しました。","rom":"Jukuryo no sue, ketsudan shimashita.","es":"Tras una profunda reflexión, tomé la decisión."}]'),
('抽象的', 'ちゅうしょうてき','ちゅうしょうてき','abstracto',    'abstract',       'N1', 'adjetivo',   54, '[{"jp":"抽象的な概念です。","rom":"Chuushouteki na gainen desu.","es":"Es un concepto abstracto."}]'),
('逐次',   'ちくじ',     'ちくじ',     'sucesivamente / uno a uno','sequentially','N1','adverbio', 39, '[{"jp":"逐次処理を行います。","rom":"Chikuji shori o okonaimasu.","es":"Realizo el procesamiento secuencial."}]'),
('精緻',   'せいち',     'せいち',     'preciso / elaborado','elaborate/precise','N1','adjetivo',  44, '[{"jp":"精緻な分析が必要です。","rom":"Seichi na bunseki ga hitsuyou desu.","es":"Se necesita un análisis preciso."}]');

-- ─────────────────────────────────────────────
-- KANJI - N5 (16 kanji)
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO kanji (character, onyomi, kunyomi, meaning, meaning_es, level, stroke_count, radical, examples) VALUES
('一', 'イチ・イツ', 'ひと', 'one', 'uno', 'N5', 1, '一', '[{"word":"一日","read":"いちにち","meaning":"un día"},{"word":"一人","read":"ひとり","meaning":"una persona"}]'),
('二', 'ニ',         'ふた', 'two', 'dos', 'N5', 2, '二', '[{"word":"二人","read":"ふたり","meaning":"dos personas"},{"word":"二月","read":"にがつ","meaning":"febrero"}]'),
('三', 'サン',       'み・みっ','three','tres','N5',3,'三','[{"word":"三日","read":"みっか","meaning":"tres días"},{"word":"三月","read":"さんがつ","meaning":"marzo"}]'),
('四', 'シ',         'よ・よん','four','cuatro','N5',5,'囗','[{"word":"四月","read":"しがつ","meaning":"abril"},{"word":"四人","read":"よにん","meaning":"cuatro personas"}]'),
('五', 'ゴ',         'いつ',  'five','cinco', 'N5', 4,'二','[{"word":"五月","read":"ごがつ","meaning":"mayo"},{"word":"五人","read":"ごにん","meaning":"cinco personas"}]'),
('六', 'ロク',       'む・むっ','six','seis', 'N5', 4,'八','[{"word":"六月","read":"ろくがつ","meaning":"junio"},{"word":"六時","read":"ろくじ","meaning":"las seis"}]'),
('七', 'シチ',       'なな',  'seven','siete','N5',2,'一','[{"word":"七月","read":"しちがつ","meaning":"julio"},{"word":"七時","read":"しちじ","meaning":"las siete"}]'),
('八', 'ハチ',       'や・やっ','eight','ocho','N5',2,'八','[{"word":"八月","read":"はちがつ","meaning":"agosto"},{"word":"八時","read":"はちじ","meaning":"las ocho"}]'),
('九', 'ク・キュウ', 'ここの','nine','nueve','N5',2,'乙','[{"word":"九月","read":"くがつ","meaning":"septiembre"},{"word":"九時","read":"くじ","meaning":"las nueve"}]'),
('十', 'ジュウ・ジッ','とお','ten','diez','N5',2,'十','[{"word":"十月","read":"じゅうがつ","meaning":"octubre"},{"word":"二十","read":"にじゅう","meaning":"veinte"}]'),
('日', 'ニチ・ジツ', 'ひ・か','sun/day','sol / día','N5',4,'日','[{"word":"日曜日","read":"にちようび","meaning":"domingo"},{"word":"今日","read":"きょう","meaning":"hoy"}]'),
('月', 'ゲツ・ガツ', 'つき',  'moon/month','luna / mes','N5',4,'月','[{"word":"月曜日","read":"げつようび","meaning":"lunes"},{"word":"来月","read":"らいげつ","meaning":"el mes que viene"}]'),
('山', 'サン',       'やま',  'mountain','montaña','N5',3,'山','[{"word":"富士山","read":"ふじさん","meaning":"Monte Fuji"},{"word":"山道","read":"やまみち","meaning":"camino de montaña"}]'),
('川', 'セン',       'かわ',  'river','río','N5',3,'川','[{"word":"川岸","read":"かわぎし","meaning":"orilla del río"},{"word":"川下り","read":"かわくだり","meaning":"descenso del río"}]'),
('人', 'ジン・ニン', 'ひと',  'person','persona','N5',2,'人','[{"word":"日本人","read":"にほんじん","meaning":"japonés"},{"word":"人気","read":"にんき","meaning":"popularidad"}]'),
('大', 'ダイ・タイ', 'おお',  'big','grande','N5',3,'大','[{"word":"大学","read":"だいがく","meaning":"universidad"},{"word":"大切","read":"たいせつ","meaning":"importante"}]');

-- ─────────────────────────────────────────────
-- KANJI - N4 (10 kanji)
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO kanji (character, onyomi, kunyomi, meaning, meaning_es, level, stroke_count, radical, examples) VALUES
('化', 'カ・ケ', 'ば・か', 'change/transform', 'cambiar', 'N4', 4, '匕', '[{"word":"文化","read":"ぶんか","meaning":"cultura"},{"word":"変化","read":"へんか","meaning":"cambio"}]'),
('親', 'シン', 'おや・した', 'parent/intimate', 'padre/madre', 'N4', 16, '見', '[{"word":"親切","read":"しんせつ","meaning":"amable"},{"word":"両親","read":"りょうしん","meaning":"padres"}]'),
('歌', 'カ', 'うた・うた', 'song/sing', 'canción', 'N4', 14, '欠', '[{"word":"歌手","read":"かしゅ","meaning":"cantante"},{"word":"国歌","read":"こっか","meaning":"himno nacional"}]'),
('遠', 'エン', 'とお', 'far/distant', 'lejos', 'N4', 13, '辵', '[{"word":"遠足","read":"えんそく","meaning":"excursión"},{"word":"遠い","read":"とおい","meaning":"lejos"}]'),
('近', 'キン', 'ちか', 'near/close', 'cerca', 'N4', 7, '辵', '[{"word":"近所","read":"きんじょ","meaning":"vecindad"},{"word":"近い","read":"ちかい","meaning":"cerca"}]'),
('明', 'メイ・ミョウ', 'あか・あ・あき', 'bright/clear', 'brillante / claro', 'N4', 8, '日', '[{"word":"明日","read":"あした","meaning":"mañana"},{"word":"明るい","read":"あかるい","meaning":"brillante"}]'),
('暗', 'アン', 'くら', 'dark', 'oscuro', 'N4', 13, '日', '[{"word":"暗号","read":"あんごう","meaning":"código"},{"word":"暗い","read":"くらい","meaning":"oscuro"}]'),
('強', 'キョウ・ゴウ', 'つよ・し', 'strong', 'fuerte', 'N4', 11, '弓', '[{"word":"強力","read":"きょうりょく","meaning":"poderoso"},{"word":"強い","read":"つよい","meaning":"fuerte"}]'),
('弱', 'ジャク', 'よわ', 'weak', 'débil', 'N4', 10, '弓', '[{"word":"弱点","read":"じゃくてん","meaning":"punto débil"},{"word":"弱い","read":"よわい","meaning":"débil"}]'),
('医', 'イ', '-', 'medicine/doctor', 'medicina', 'N4', 7, '匸', '[{"word":"医者","read":"いしゃ","meaning":"médico"},{"word":"医学","read":"いがく","meaning":"medicina"}]');

-- ─────────────────────────────────────────────
-- KANJI - N3 (10 kanji)
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO kanji (character, onyomi, kunyomi, meaning, meaning_es, level, stroke_count, radical, examples) VALUES
('感', 'カン', 'かん', 'feeling/sense', 'sentido / sentir', 'N3', 13, '心', '[{"word":"感じる","read":"かんじる","meaning":"sentir"},{"word":"感情","read":"かんじょう","meaning":"emoción"}]'),
('情', 'ジョウ・セイ', 'なさけ', 'emotion/feeling', 'emoción', 'N3', 11, '心', '[{"word":"情報","read":"じょうほう","meaning":"información"},{"word":"感情","read":"かんじょう","meaning":"emoción"}]'),
('意', 'イ', '-', 'idea/intention', 'intención', 'N3', 13, '心', '[{"word":"意見","read":"いけん","meaning":"opinión"},{"word":"意味","read":"いみ","meaning":"significado"}]'),
('識', 'シキ', 'し', 'knowledge/consciousness', 'conocimiento', 'N3', 19, '言', '[{"word":"知識","read":"ちしき","meaning":"conocimiento"},{"word":"意識","read":"いしき","meaning":"conciencia"}]'),
('解', 'カイ・ゲ', 'と・ほど', 'understand/solve', 'entender / resolver', 'N3', 13, '角', '[{"word":"理解","read":"りかい","meaning":"comprensión"},{"word":"解決","read":"かいけつ","meaning":"solución"}]'),
('論', 'ロン', '-', 'argument/theory', 'argumento', 'N3', 15, '言', '[{"word":"議論","read":"ぎろん","meaning":"debate"},{"word":"論文","read":"ろんぶん","meaning":"tesis"}]'),
('判', 'ハン・バン', '-', 'judgment', 'juicio', 'N3', 7, '刀', '[{"word":"判断","read":"はんだん","meaning":"juicio"},{"word":"批判","read":"ひはん","meaning":"crítica"}]'),
('断', 'ダン', 'た・ことわ', 'cut/decide', 'decidir / cortar', 'N3', 11, '斤', '[{"word":"判断","read":"はんだん","meaning":"juicio"},{"word":"断る","read":"ことわる","meaning":"rechazar"}]'),
('態', 'タイ', '-', 'attitude/state', 'actitud', 'N3', 14, '心', '[{"word":"態度","read":"たいど","meaning":"actitud"},{"word":"状態","read":"じょうたい","meaning":"estado"}]'),
('況', 'キョウ', '-', 'condition/situation', 'situación', 'N3', 7, '氵', '[{"word":"状況","read":"じょうきょう","meaning":"situación"},{"word":"況や","read":"いわんや","meaning":"mucho menos"}]');

-- ─────────────────────────────────────────────
-- KANJI - N2 (10 kanji)
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO kanji (character, onyomi, kunyomi, meaning, meaning_es, level, stroke_count, radical, examples) VALUES
('概', 'ガイ', 'おおむ', 'general/outline', 'en general', 'N2', 14, '木', '[{"word":"概念","read":"がいねん","meaning":"concepto"},{"word":"概要","read":"がいよう","meaning":"resumen"}]'),
('傾', 'ケイ', 'かたむ', 'lean/tendency', 'inclinarse', 'N2', 13, '亻', '[{"word":"傾向","read":"けいこう","meaning":"tendencia"},{"word":"傾く","read":"かたむく","meaning":"inclinarse"}]'),
('促', 'ソク', 'うなが', 'urge/promote', 'urgir / promover', 'N2', 9, '亻', '[{"word":"促進","read":"そくしん","meaning":"promoción"},{"word":"促す","read":"うながす","meaning":"urgir"}]'),
('握', 'アク', 'にぎ', 'grasp/hold', 'agarrar', 'N2', 12, '手', '[{"word":"把握","read":"はあく","meaning":"comprensión"},{"word":"握手","read":"あくしゅ","meaning":"apretón de manos"}]'),
('施', 'シ・セ', 'ほどこ', 'carry out/apply', 'aplicar', 'N2', 9, '方', '[{"word":"実施","read":"じっし","meaning":"implementación"},{"word":"施設","read":"しせつ","meaning":"instalación"}]'),
('維', 'イ', '-', 'maintain/fiber', 'mantener', 'N2', 14, '糸', '[{"word":"維持","read":"いじ","meaning":"mantenimiento"},{"word":"繊維","read":"せんい","meaning":"fibra"}]'),
('整', 'セイ', 'ととの', 'arrange/prepare', 'organizar', 'N2', 16, '攴', '[{"word":"整備","read":"せいび","meaning":"preparación"},{"word":"整理","read":"せいり","meaning":"organización"}]'),
('検', 'ケン', '-', 'examine/inspect', 'examinar', 'N2', 12, '木', '[{"word":"検討","read":"けんとう","meaning":"consideración"},{"word":"検査","read":"けんさ","meaning":"inspección"}]'),
('討', 'トウ', 'う', 'attack/discuss', 'discutir', 'N2', 10, '言', '[{"word":"検討","read":"けんとう","meaning":"examen / consideración"},{"word":"討論","read":"とうろん","meaning":"debate"}]'),
('措', 'ソ', '-', 'manage/set aside', 'gestionar', 'N2', 11, '手', '[{"word":"措置","read":"そち","meaning":"medida"},{"word":"措く","read":"おく","meaning":"dejar aparte"}]');

-- ─────────────────────────────────────────────
-- KANJI - N1 (8 kanji)
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO kanji (character, onyomi, kunyomi, meaning, meaning_es, level, stroke_count, radical, examples) VALUES
('懸', 'ケン・ケ', 'か', 'hang/concern', 'preocupación', 'N1', 20, '心', '[{"word":"懸念","read":"けねん","meaning":"preocupación"},{"word":"懸命","read":"けんめい","meaning":"con todas las fuerzas"}]'),
('膨', 'ボウ', 'ふく', 'swell/expand', 'hincharse', 'N1', 16, '肉', '[{"word":"膨大","read":"ぼうだい","meaning":"enorme"},{"word":"膨らむ","read":"ふくらむ","meaning":"hincharse"}]'),
('顕', 'ケン', 'あらわ', 'appear/manifest', 'manifestar', 'N1', 18, '頁', '[{"word":"顕著","read":"けんちょ","meaning":"notable"},{"word":"顕在化","read":"けんざいか","meaning":"materialización"}]'),
('慎', 'シン', 'つつし', 'prudent/careful', 'prudente', 'N1', 13, '心', '[{"word":"慎重","read":"しんちょう","meaning":"cauteloso"},{"word":"慎む","read":"つつしむ","meaning":"ser cuidadoso"}]'),
('汎', 'ハン', '-', 'general/wide', 'general', 'N1', 6, '氵', '[{"word":"汎用","read":"はんよう","meaning":"uso general"},{"word":"汎アジア","read":"はんアジア","meaning":"pan-asiático"}]'),
('拭', 'ショク', 'ぬぐ・ふ', 'wipe/clean', 'limpiar', 'N1', 9, '手', '[{"word":"払拭","read":"ふっしょく","meaning":"disipación"},{"word":"拭く","read":"ふく","meaning":"limpiar"}]'),
('醸', 'ジョウ', 'かも', 'brew/cause', 'fermentar', 'N1', 20, '酉', '[{"word":"醸成","read":"じょうせい","meaning":"fomento"},{"word":"醸造","read":"じょうぞう","meaning":"elaboración"}]'),
('俯', 'フ', 'うつむ・ふ', 'look down', 'mirar hacia abajo', 'N1', 10, '亻', '[{"word":"俯瞰","read":"ふかん","meaning":"vista panorámica"},{"word":"俯く","read":"うつむく","meaning":"agachar la cabeza"}]');

-- ─────────────────────────────────────────────
-- GRAMMAR POINTS - N5 (6 points)
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO grammar_points (title, pattern, explanation, explanation_es, structure, examples, level, category) VALUES
('Ser / Estar (presente)',
 '～は～です',
 'Affirmative copula in present tense. Used to state facts, identities, and descriptions.',
 'Cópula afirmativa en presente. Se usa para afirmar hechos, identidades y descripciones.',
 'Sustantivo は Sustantivo/Adjetivo です',
 '[{"jp":"私は学生です。","rom":"Watashi wa gakusei desu.","es":"Soy estudiante."},{"jp":"今日は月曜日です。","rom":"Kyou wa getsuyoubi desu.","es":"Hoy es lunes."}]',
 'N5', 'cópula'),

('Negación presente',
 '～は～ではありません / じゃないです',
 'Negative copula in present tense.',
 'Cópula negativa en presente. ではありません es más formal; じゃないです es coloquial.',
 'Sustantivo は Sustantivo ではありません',
 '[{"jp":"私は先生ではありません。","rom":"Watashi wa sensei dewa arimasen.","es":"No soy profesor."},{"jp":"これは本じゃないです。","rom":"Kore wa hon ja nai desu.","es":"Esto no es un libro."}]',
 'N5', 'cópula'),

('Gustar algo',
 '～が好きです',
 'Expression to say you like something. The object is marked with が.',
 'Expresión para decir que te gusta algo. El objeto se marca con が.',
 'Sustantivo が 好きです',
 '[{"jp":"日本語が好きです。","rom":"Nihongo ga suki desu.","es":"Me gusta el japonés."},{"jp":"音楽が大好きです。","rom":"Ongaku ga daisuki desu.","es":"Me encanta la música."}]',
 'N5', 'expresión'),

('Solicitar educadamente',
 '～をください',
 'Used to politely request something. The object is marked with を.',
 'Se usa para pedir algo educadamente. El objeto se marca con を.',
 'Sustantivo を ください',
 '[{"jp":"水をください。","rom":"Mizu o kudasai.","es":"Por favor, deme agua."},{"jp":"そのパンをください。","rom":"Sono pan o kudasai.","es":"Por favor, deme ese pan."}]',
 'N5', 'expresión'),

('Acción en progreso',
 '～ています / ～ている',
 'Indicates an action is currently in progress, or a state resulting from a past action.',
 'Indica que una acción está en progreso, o el estado resultante de una acción pasada.',
 'Verbo（て形）います',
 '[{"jp":"今、食べています。","rom":"Ima, tabete imasu.","es":"Ahora estoy comiendo."},{"jp":"結婚しています。","rom":"Kekkon shite imasu.","es":"Estoy casado/a."}]',
 'N5', 'verbo'),

('Pedir que hagan algo',
 '～てください',
 'Used to politely request someone to do an action.',
 'Se usa para pedir educadamente a alguien que haga algo.',
 'Verbo（て形）ください',
 '[{"jp":"ここに座ってください。","rom":"Koko ni suwatte kudasai.","es":"Por favor, siéntese aquí."},{"jp":"ゆっくり話してください。","rom":"Yukkuri hanashite kudasai.","es":"Por favor, hable despacio."}]',
 'N5', 'verbo');

-- ─────────────────────────────────────────────
-- GRAMMAR POINTS - N4 (6 points)
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO grammar_points (title, pattern, explanation, explanation_es, structure, examples, level, category) VALUES
('Experiencia pasada',
 '～たことがある',
 'Expresses the idea of having experienced something at least once in the past.',
 'Expresa haber tenido una experiencia al menos una vez en el pasado.',
 'Verbo（た形）ことがある',
 '[{"jp":"日本に行ったことがあります。","rom":"Nihon ni itta koto ga arimasu.","es":"He ido a Japón."},{"jp":"寿司を食べたことがありますか。","rom":"Sushi o tabeta koto ga arimasu ka.","es":"¿Has comido sushi alguna vez?"}]',
 'N4', 'verbo'),

('Hacer el esfuerzo de',
 '～ようにする',
 'Expresses making an effort to do something or making it so that something happens.',
 'Expresa hacer el esfuerzo de hacer algo o procurar que algo suceda.',
 'Verbo（辞書形/ない形）ようにする',
 '[{"jp":"毎日運動するようにしています。","rom":"Mainichi undou suru you ni shite imasu.","es":"Me esfuerzo por hacer ejercicio todos los días."},{"jp":"遅刻しないようにします。","rom":"Chikoku shinai you ni shimasu.","es":"Procuro no llegar tarde."}]',
 'N4', 'verbo'),

('Con el propósito de',
 '～ために',
 'Expresses purpose (in order to) or cause (because of/due to).',
 'Expresa propósito (para / con el fin de) o causa (debido a / a causa de).',
 'Verbo（辞書形）ために / Sustantivo の ために',
 '[{"jp":"日本語を勉強するために、日本に来ました。","rom":"Nihongo o benkyou suru tame ni, Nihon ni kimashita.","es":"Vine a Japón para estudiar japonés."},{"jp":"健康のために、野菜を食べます。","rom":"Kenkou no tame ni, yasai o tabemasu.","es":"Como verduras por mi salud."}]',
 'N4', 'partícula'),

('Según / por medio de',
 '～によって',
 'Expresses agent (by), means (by/through), or variation depending on something.',
 'Expresa agente (por), medio (a través de), o variación según algo.',
 'Sustantivo によって',
 '[{"jp":"この絵はピカソによって描かれました。","rom":"Kono e wa Pikaso ni yotte kakaremashita.","es":"Este cuadro fue pintado por Picasso."},{"jp":"人によって意見が違います。","rom":"Hito ni yotte iken ga chigaimasu.","es":"Las opiniones varían según la persona."}]',
 'N4', 'partícula'),

('Solo / nada más que',
 '～ばかり',
 'Indicates that something is done excessively or that there is only one thing.',
 'Indica que algo se hace en exceso o que solo hay una cosa.',
 'Verbo（て形）ばかりいる / Sustantivo ばかり',
 '[{"jp":"ゲームばかりしています。","rom":"Geemu bakari shite imasu.","es":"No hago más que jugar videojuegos."},{"jp":"彼は文句ばかり言います。","rom":"Kare wa monku bakari iimasu.","es":"Él no hace más que quejarse."}]',
 'N4', 'partícula'),

('Haber llegado a',
 '～ようになる',
 'Expresses a change in state or ability over time.',
 'Expresa un cambio de estado o habilidad a lo largo del tiempo.',
 'Verbo（辞書形/ない形）ようになる',
 '[{"jp":"漢字が読めるようになりました。","rom":"Kanji ga yomeru you ni narimashita.","es":"Ya puedo leer kanji."},{"jp":"毎日勉強するようになりました。","rom":"Mainichi benkyou suru you ni narimashita.","es":"Llegué a estudiar todos los días."}]',
 'N4', 'verbo');

-- ─────────────────────────────────────────────
-- GRAMMAR POINTS - N3 (5 points)
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO grammar_points (title, pattern, explanation, explanation_es, structure, examples, level, category) VALUES
('En relación a / respecto a',
 '～に関して / ～に関する',
 'Expresses "regarding" or "concerning" a topic.',
 'Expresa "en relación a" o "respecto a" un tema.',
 'Sustantivo に関して(は) / に関する Sustantivo',
 '[{"jp":"環境問題に関して、発表します。","rom":"Kankyou mondai ni kanshite, happyou shimasu.","es":"Haré una presentación sobre los problemas ambientales."},{"jp":"この件に関する情報がありません。","rom":"Kono ken ni kansuru jouhou ga arimasen.","es":"No hay información sobre este asunto."}]',
 'N3', 'partícula'),

('Hacia / con respecto a',
 '～に対して / ～に対する',
 'Expresses contrast, target of an action, or attitude toward something.',
 'Expresa contraste, objetivo de una acción, o actitud hacia algo.',
 'Sustantivo に対して / に対する Sustantivo',
 '[{"jp":"子供に対して優しくしてください。","rom":"Kodomo ni taishite yasashiku shite kudasai.","es":"Sea amable con los niños."},{"jp":"問題に対する解決策が必要です。","rom":"Mondai ni taisuru kaiketsu saku ga hitsuyou desu.","es":"Se necesita una solución al problema."}]',
 'N3', 'partícula'),

('Según / de acuerdo con',
 '～によると / ～によれば',
 'Expresses a source of information: "according to..."',
 'Expresa fuente de información: "según..." o "de acuerdo con...".',
 'Sustantivo によると / によれば',
 '[{"jp":"天気予報によると、明日は雨だそうです。","rom":"Tenki yohou ni yoru to, ashita wa ame da sou desu.","es":"Según el pronóstico del tiempo, mañana lloverá."},{"jp":"彼の話によれば、試験は簡単だったそうです。","rom":"Kare no hanashi ni yoreba, shiken wa kantan datta sou desu.","es":"Según lo que él dijo, el examen fue fácil."}]',
 'N3', 'partícula'),

('Resulta que / es lógico que',
 '～わけだ / ～わけがない',
 'わけだ expresses logical conclusion; わけがない expresses impossibility.',
 'わけだ expresa conclusión lógica; わけがない expresa imposibilidad.',
 'Verbo / Adjetivo / Sustantivo の わけだ',
 '[{"jp":"毎日練習しているから、上手になったわけだ。","rom":"Mainichi renshuu shite iru kara, jouzu ni natta wake da.","es":"Como practicaba todos los días, tiene sentido que haya mejorado."},{"jp":"あんな難しい試験に合格できるわけがない。","rom":"Anna muzukashii shiken ni goukaku dekiru wake ga nai.","es":"Es imposible aprobar un examen tan difícil."}]',
 'N3', 'expresión'),

('Aunque / a pesar de',
 '～ものの',
 'Expresses contrast: "although" or "even though" with a nuance of disappointment.',
 'Expresa contraste: "aunque" o "a pesar de" con matiz de decepción.',
 'Verbo / Adjetivo / Sustantivo の ものの',
 '[{"jp":"勉強したものの、試験に落ちました。","rom":"Benkyou shita mono no, shiken ni ochimashita.","es":"Aunque estudié, reproché el examen."},{"jp":"賛成したものの、不安が残ります。","rom":"Sansei shita mono no, fuan ga nokorimasu.","es":"Aunque estoy de acuerdo, me queda incertidumbre."}]',
 'N3', 'conjunción');

-- ─────────────────────────────────────────────
-- GRAMMAR POINTS - N2 (4 points)
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO grammar_points (title, pattern, explanation, explanation_es, structure, examples, level, category) VALUES
('Junto con / al mismo tiempo que',
 '～に伴って / ～に伴い',
 'Expresses that something changes together with something else.',
 'Expresa que algo cambia junto con otra cosa. Implica causa-efecto simultáneo.',
 'Sustantivo に伴って / Verbo 辞書形 に伴って',
 '[{"jp":"技術の発展に伴って、生活が便利になった。","rom":"Gijutsu no hatten ni tomonatte, seikatsu ga benri ni natta.","es":"A medida que la tecnología avanzó, la vida se volvió más conveniente."},{"jp":"少子化に伴い、学校の数が減った。","rom":"Shoushika ni tomonai, gakkou no kazu ga hetta.","es":"Con la disminución de la natalidad, el número de escuelas disminuyó."}]',
 'N2', 'conjunción'),

('Alrededor de / a propósito de',
 '～をめぐって / ～をめぐる',
 'Expresses disputes, debates, or issues surrounding something.',
 'Expresa disputas, debates o problemas en torno a algo.',
 'Sustantivo をめぐって / をめぐる Sustantivo',
 '[{"jp":"土地をめぐって争いが起きました。","rom":"Tochi o megutte arasoi ga okimashita.","es":"Ocurrió un conflicto a causa de la tierra."},{"jp":"この問題をめぐる議論は続いています。","rom":"Kono mondai o meguru giron wa tsuzuite imasu.","es":"El debate sobre este problema continúa."}]',
 'N2', 'partícula'),

('Incluyendo / comenzando por',
 '～をはじめ / ～をはじめとして',
 'Expresses representative examples: "including ~ and others".',
 'Expresa ejemplos representativos: "incluyendo ~ y otros".',
 'Sustantivo をはじめ（として）',
 '[{"jp":"東京をはじめ、大阪や名古屋でも開催されます。","rom":"Toukyou o hajime, Osaka ya Nagoya demo kaisai saremasu.","es":"Se celebrará en Tokio y también en Osaka, Nagoya, entre otras."}]',
 'N2', 'partícula'),

('Teniendo en cuenta / basándose en',
 '～を踏まえて / ～を踏まえた',
 'Expresses taking something into account as a basis for action or judgment.',
 'Expresa tener algo en cuenta como base para actuar o juzgar.',
 'Sustantivo を踏まえて / Verbo た形 結果を踏まえて',
 '[{"jp":"調査結果を踏まえて、計画を立てました。","rom":"Chousa kekka o fumaete, keikaku o tatemashita.","es":"Elaboré el plan basándome en los resultados de la investigación."},{"jp":"前回の経験を踏まえた対策を取ります。","rom":"Zenkai no keiken o fumaeta taisaku o torimasu.","es":"Tomo medidas basándome en la experiencia anterior."}]',
 'N2', 'conjunción');

-- ─────────────────────────────────────────────
-- GRAMMAR POINTS - N1 (4 points)
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO grammar_points (title, pattern, explanation, explanation_es, structure, examples, level, category) VALUES
('Con / mediante (formal)',
 '～をもって',
 'Formal expression meaning "with/by means of" or indicating a deadline/end point.',
 'Expresión formal que significa "con / mediante" o indica un plazo o punto final.',
 'Sustantivo をもって',
 '[{"jp":"本日をもって退職いたします。","rom":"Honjitsu o motte taishoku itashimasu.","es":"A partir de hoy me retiro."},{"jp":"努力をもって夢を実現しました。","rom":"Doryoku o motte yume o jitsugen shimashita.","es":"Con esfuerzo, hice realidad mi sueño."}]',
 'N1', 'partícula'),

('Nada indica que... y menos aún',
 '～ならいざしらず',
 'Expresses "if it were ~ I could understand, but..." implying an extreme contrast.',
 'Expresa "si fuera ~ lo entendería, pero...". Implica contraste extremo.',
 'Sustantivo / Verbo ならいざしらず',
 '[{"jp":"学生ならいざしらず、社会人がそんなことを言うのは問題だ。","rom":"Gakusei nara iza shirazu, shakaijin ga sonna koto o iu no wa mondai da.","es":"Si fuera un estudiante lo entendería, pero es un problema que un adulto trabador diga eso."}]',
 'N1', 'expresión'),

('Más que nunca / por encima de todo',
 '～にもまして',
 'Expresses surpassing or exceeding; "more than ever" or "above all".',
 'Expresa superar o exceder; "más que nunca" o "por encima de todo".',
 'Sustantivo / 疑問詞 にもまして',
 '[{"jp":"今年は例年にもまして暑い夏でした。","rom":"Kotoshi wa reinen ni mo mashite atsui natsu deshita.","es":"Este verano fue más caluroso que cualquier otro año."},{"jp":"何にもまして健康が大切です。","rom":"Nani ni mo mashite kenkou ga taisetsu desu.","es":"La salud es lo más importante por encima de todo."}]',
 'N1', 'conjunción'),

('Verse obligado a',
 '～を余儀なくされる',
 'Expresses being forced to do something due to circumstances beyond one''s control.',
 'Expresa verse obligado a hacer algo debido a circunstancias ajenas al control propio.',
 'Sustantivo を余儀なくされる',
 '[{"jp":"悪天候により、試合の中止を余儀なくされた。","rom":"Akutenkou ni yori, shiai no chuushi o yogi naku sareta.","es":"Debido al mal tiempo, se vieron obligados a cancelar el partido."},{"jp":"会社は工場閉鎖を余儀なくされた。","rom":"Kaisha wa koujou heisa o yogi naku sareta.","es":"La empresa se vio obligada a cerrar la fábrica."}]',
 'N1', 'expresión');

-- ─────────────────────────────────────────────
-- THEORY ARTICLES
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO theory_articles (title, content, level, category, order_index) VALUES
('Las Partículas Básicas del Japonés',
'<h2>Las Partículas Básicas del Japonés</h2>
<p>Las partículas son elementos gramaticales que definen la función de cada palabra en la oración. Son esenciales para construir frases correctas en japonés.</p>
<h3>は (wa) - Partícula de tema</h3>
<p>Marca el tema de la oración. No indica quién hace la acción, sino de qué estamos hablando.</p>
<pre>私は学生です。(Watashi wa gakusei desu.)
→ Soy estudiante. [el tema soy yo]</pre>
<h3>が (ga) - Partícula de sujeto</h3>
<p>Marca el sujeto gramatical, especialmente en preguntas, oraciones con verbos de percepción y contraposición.</p>
<pre>誰が来ましたか。(Dare ga kimashita ka.)
→ ¿Quién vino?</pre>
<h3>を (wo/o) - Partícula de objeto directo</h3>
<p>Marca el objeto directo de la acción.</p>
<pre>本を読みます。(Hon o yomimasu.)
→ Leo un libro.</pre>
<h3>に (ni) - Partícula de destino/tiempo/ubicación</h3>
<p>Indica destino de movimiento, ubicación, momento específico o receptor de una acción.</p>
<pre>学校に行きます。(Gakkou ni ikimasu.) → Voy a la escuela.
3時に起きます。(Sanji ni okimasu.) → Me levanto a las 3.</pre>
<h3>で (de) - Partícula de lugar/medio</h3>
<p>Indica el lugar donde ocurre la acción o el medio por el que se hace.</p>
<pre>図書館で勉強します。(Toshokan de benkyou shimasu.) → Estudio en la biblioteca.
電車で行きます。(Densha de ikimasu.) → Voy en tren.</pre>
<h3>の (no) - Partícula posesiva/relacional</h3>
<p>Indica posesión o relación entre sustantivos.</p>
<pre>私の本 (watashi no hon) → mi libro
日本語の先生 (nihongo no sensei) → profesor de japonés</pre>',
'N5', 'partículas', 1),

('Los Verbos en Japonés: Grupos y Conjugaciones',
'<h2>Los Verbos en Japonés: Grupos y Conjugaciones</h2>
<p>Los verbos en japonés se dividen en tres grupos con reglas de conjugación distintas.</p>
<h3>Grupo 1 (五段動詞 - Godan): verbos -u</h3>
<p>La raíz termina en una consonante. La conjugación cambia la vocal final.</p>
<table border="1" cellpadding="8">
<tr><th>Forma</th><th>書く (kaku)</th><th>Significado</th></tr>
<tr><td>Diccionario</td><td>書く</td><td>escribir</td></tr>
<tr><td>Presente/futuro</td><td>書きます</td><td>escribo / escribiré</td></tr>
<tr><td>Negativo</td><td>書きません</td><td>no escribo</td></tr>
<tr><td>Pasado</td><td>書きました</td><td>escribí</td></tr>
<tr><td>Forma て</td><td>書いて</td><td>escribiendo...</td></tr>
</table>
<h3>Grupo 2 (一段動詞 - Ichidan): verbos -ru</h3>
<p>La raíz termina en い o え. La conjugación solo cambia el final る.</p>
<table border="1" cellpadding="8">
<tr><th>Forma</th><th>食べる (taberu)</th><th>Significado</th></tr>
<tr><td>Diccionario</td><td>食べる</td><td>comer</td></tr>
<tr><td>Presente/futuro</td><td>食べます</td><td>como / comeré</td></tr>
<tr><td>Negativo</td><td>食べません</td><td>no como</td></tr>
<tr><td>Pasado</td><td>食べました</td><td>comí</td></tr>
<tr><td>Forma て</td><td>食べて</td><td>comiendo...</td></tr>
</table>
<h3>Grupo 3 (不規則動詞 - Fukisoku): verbos irregulares</h3>
<p>Solo hay dos: する (suru - hacer) y くる (kuru - venir).</p>
<pre>する → します / しません / しました / して
くる → きます / きません / きました / きて</pre>',
'N5', 'verbos', 2),

('Los Adjetivos en Japonés: i-adjetivos y na-adjetivos',
'<h2>Los Adjetivos en Japonés</h2>
<p>En japonés existen dos tipos principales de adjetivos: los i-adjetivos (形容詞) y los na-adjetivos (形容動詞).</p>
<h3>I-adjetivos (形容詞)</h3>
<p>Terminan en い y se conjugan directamente.</p>
<ul>
<li>Afirmativo presente: <strong>高い</strong>です (takai desu) - Es caro</li>
<li>Negativo presente: <strong>高くない</strong>です (takakunai desu) - No es caro</li>
<li>Pasado afirmativo: <strong>高かった</strong>です (takakatta desu) - Era caro</li>
<li>Pasado negativo: <strong>高くなかった</strong>です (takakunakatta desu) - No era caro</li>
</ul>
<h3>Na-adjetivos (形容動詞)</h3>
<p>Necesitan な para modificar sustantivos y です para predicados.</p>
<ul>
<li>Afirmativo presente: <strong>静か</strong>です (shizuka desu) - Es tranquilo</li>
<li>Negativo presente: <strong>静かじゃない</strong>です - No es tranquilo</li>
<li>Pasado afirmativo: <strong>静かでした</strong> - Era tranquilo</li>
<li>Al modificar: <strong>静かな</strong>部屋 - una habitación tranquila</li>
</ul>
<h3>Excepción importante</h3>
<p>いい (bueno) es irregular: su negativo y pasado usan よい.</p>
<pre>いい → よくない (no es bueno) → よかった (era bueno) → よくなかった</pre>',
'N5', 'adjetivos', 3),

('Expresiones de Tiempo en Japonés',
'<h2>Expresiones de Tiempo en Japonés</h2>
<p>El japonés tiene un rico vocabulario para expresar el tiempo. Aprender estas expresiones es fundamental para el JLPT N5.</p>
<h3>Días de la semana</h3>
<table border="1" cellpadding="8">
<tr><th>Kanji</th><th>Lectura</th><th>Significado</th></tr>
<tr><td>月曜日</td><td>げつようび</td><td>Lunes</td></tr>
<tr><td>火曜日</td><td>かようび</td><td>Martes</td></tr>
<tr><td>水曜日</td><td>すいようび</td><td>Miércoles</td></tr>
<tr><td>木曜日</td><td>もくようび</td><td>Jueves</td></tr>
<tr><td>金曜日</td><td>きんようび</td><td>Viernes</td></tr>
<tr><td>土曜日</td><td>どようび</td><td>Sábado</td></tr>
<tr><td>日曜日</td><td>にちようび</td><td>Domingo</td></tr>
</table>
<h3>Expresiones relativas</h3>
<ul>
<li>今日 (きょう) - hoy</li>
<li>明日/あした (あした) - mañana</li>
<li>昨日 (きのう) - ayer</li>
<li>今週 (こんしゅう) - esta semana</li>
<li>来週 (らいしゅう) - la semana próxima</li>
<li>先週 (せんしゅう) - la semana pasada</li>
<li>今月 (こんげつ) - este mes</li>
<li>来月 (らいげつ) - el mes próximo</li>
<li>先月 (せんげつ) - el mes pasado</li>
</ul>',
'N5', 'vocabulario', 4),

('Consejos para el JLPT: Estrategia de Examen',
'<h2>Consejos para el JLPT: Estrategia de Examen</h2>
<p>El JLPT (Japanese Language Proficiency Test) evalúa comprensión del idioma, no producción. Estos consejos te ayudarán a maximizar tu puntuación.</p>
<h3>Estructura del examen</h3>
<ul>
<li><strong>知識問題 (Conocimiento lingüístico):</strong> Vocabulario, gramática y kanji</li>
<li><strong>読解 (Comprensión lectora):</strong> Textos con preguntas</li>
<li><strong>聴解 (Comprensión auditiva):</strong> Diálogos y conversaciones</li>
</ul>
<h3>Estrategias generales</h3>
<ol>
<li><strong>Lee la pregunta primero.</strong> En comprensión lectora, saber qué buscar ahorra tiempo.</li>
<li><strong>Elimina opciones incorrectas.</strong> Incluso si no sabes la respuesta, reduce las posibilidades.</li>
<li><strong>No te quedes atascado.</strong> Si una pregunta es difícil, responde lo mejor que puedas y avanza.</li>
<li><strong>Gestiona el tiempo.</strong> El JLPT tiene tiempo limitado. Practica la velocidad de lectura.</li>
<li><strong>Repasa el vocabulario del nivel.</strong> El vocabulario es la base de todo lo demás.</li>
</ol>
<h3>Para el listening</h3>
<p>El audio se reproduce solo una vez. Escucha las instrucciones con atención. Anota palabras clave mientras escuchas.</p>
<h3>Puntuación mínima</h3>
<p>No basta con tener una buena puntuación total. Cada sección tiene una puntuación mínima requerida (通過点). Si no alcanzas el mínimo en alguna sección, repruebes aunque tu total sea alto.</p>',
'ALL', 'consejos', 5);

-- ─────────────────────────────────────────────
-- EXAM QUESTIONS - N5 (8 questions)
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO exam_questions (question_text, question_type, level, correct_answer, explanation, difficulty) VALUES
('「山」の読み方はどれですか？', 'kanji', 'N5', 'A', 'やま (yama) es la lectura kun''yomi de 山, que significa "montaña".', 1),
('「食べる」の意味はどれですか？', 'vocabulary', 'N5', 'B', 'たべる (taberu) significa "comer".', 1),
('（　　）に入る正しい言葉はどれですか？「私___学生です。」', 'grammar', 'N5', 'A', 'は (wa) es la partícula de tema que conecta el sujeto con el predicado.', 1),
('「大きい」の反対語（はんたいご）はどれですか？', 'vocabulary', 'N5', 'C', '小さい (ちいさい) es el antónimo de 大きい (grande).', 1),
('（　　）に入る正しい言葉はどれですか？「本___読みます。」', 'grammar', 'N5', 'B', 'を (wo/o) es la partícula de objeto directo.', 1),
('「電車」の読み方はどれですか？', 'kanji', 'N5', 'D', 'でんしゃ (densha) es la lectura de 電車, que significa "tren".', 1),
('「今日」の読み方はどれですか？', 'kanji', 'N5', 'C', 'きょう (kyou) es la lectura especial de 今日, que significa "hoy".', 2),
('「友達と___映画を見ました。」正しい文はどれですか？', 'grammar', 'N5', 'A', 'と (to) se usa para indicar compañía: "con los amigos".', 2);

INSERT OR IGNORE INTO exam_options (question_id, option_text, option_label) VALUES
(1, 'やま',    'A'), (1, 'さん',    'B'), (1, 'かわ',    'C'), (1, 'うみ',    'D'),
(2, 'のむ',    'A'), (2, 'たべる',  'B'), (2, 'みる',    'C'), (2, 'かく',    'D'),
(3, 'は',      'A'), (3, 'が',      'B'), (3, 'を',      'C'), (3, 'に',      'D'),
(4, 'たかい',  'A'), (4, 'やすい',  'B'), (4, 'ちいさい','C'), (4, 'ながい',  'D'),
(5, 'が',      'A'), (5, 'を',      'B'), (5, 'は',      'C'), (5, 'で',      'D'),
(6, 'でんき',  'A'), (6, 'きしゃ',  'B'), (6, 'ちかてつ','C'), (6, 'でんしゃ','D'),
(7, 'こんにち','A'), (7, 'あした',  'B'), (7, 'きょう',  'C'), (7, 'きのう',  'D'),
(8, 'と',      'A'), (8, 'で',      'B'), (8, 'に',      'C'), (8, 'が',      'D');

-- ─────────────────────────────────────────────
-- EXAM QUESTIONS - N4 (6 questions)
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO exam_questions (question_text, question_type, level, correct_answer, explanation, difficulty) VALUES
('日本に行った___がありますか？', 'grammar', 'N4', 'B', 'ことがある expresa experiencia pasada. "¿Has ido a Japón alguna vez?"', 2),
('毎日運動する___にしています。', 'grammar', 'N4', 'C', 'ようにする expresa hacer el esfuerzo de hacer algo de forma habitual.', 2),
('「確認」の意味はどれですか？', 'vocabulary', 'N4', 'A', '確認 (かくにん) significa "confirmar" o "verificar".', 2),
('「説明する」の意味はどれですか？', 'vocabulary', 'N4', 'D', '説明する (せつめいする) significa "explicar".', 2),
('健康___、野菜をたくさん食べます。', 'grammar', 'N4', 'B', 'のために indica propósito. "Como muchas verduras por la salud."', 2),
('「残念」はどんな意味ですか？', 'vocabulary', 'N4', 'C', '残念 (ざんねん) significa "lástima" o "qué pena".', 2);

INSERT OR IGNORE INTO exam_options (question_id, option_text, option_label) VALUES
(9,  'こと',          'A'), (9,  'ことがある',   'B'), (9,  'ところがある', 'C'), (9,  'ことだ',      'D'),
(10, 'ようにある',    'A'), (10, 'ためにする',   'B'), (10, 'ようにする',   'C'), (10, 'ためになる',  'D'),
(11, 'かくにん',      'A'), (11, 'かんがえ',     'B'), (11, 'しらべ',       'C'), (11, 'けいかく',    'D'),
(12, 'けいかくする',  'A'), (12, 'しょうかいする','B'),(12, 'かんがえる',   'C'), (12, 'せつめいする','D'),
(13, 'のために',      'A'), (13, 'のために',     'B'), (13, 'によって',     'C'), (13, 'において',    'D'),
(14, 'うれしい',      'A'), (14, 'たのしい',     'B'), (14, 'ざんねん',     'C'), (14, 'しんぱい',    'D');

-- ─────────────────────────────────────────────
-- EXAM QUESTIONS - N3 (6 questions)
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO exam_questions (question_text, question_type, level, correct_answer, explanation, difficulty) VALUES
('天気予報___、明日は雨だそうです。', 'grammar', 'N3', 'C', 'によると indica fuente de información. "Según el pronóstico del tiempo."', 3),
('「影響」の意味はどれですか？', 'vocabulary', 'N3', 'A', '影響 (えいきょう) significa "influencia" o "efecto".', 3),
('一生懸命勉強した___、試験に落ちました。', 'grammar', 'N3', 'D', 'ものの expresa contraste con decepción. "Aunque estudié mucho, reprobé."', 3),
('「判断」の意味はどれですか？', 'vocabulary', 'N3', 'B', '判断 (はんだん) significa "juicio" o "decisión".', 3),
('環境問題___、深刻な議論が行われている。', 'grammar', 'N3', 'A', 'に関して indica "en relación a". "Se está debatiendo seriamente sobre los problemas ambientales."', 3),
('「確かに」の使い方として正しいものはどれですか？', 'grammar', 'N3', 'C', '確かに (たしかに) es un adverbio que significa "ciertamente" y se usa para confirmar algo.', 3);

INSERT OR IGNORE INTO exam_options (question_id, option_text, option_label) VALUES
(15, 'にとって',   'A'), (15, 'において',   'B'), (15, 'によると',   'C'), (15, 'に対して',   'D'),
(16, 'えいきょう', 'A'), (16, 'じょうきょう','B'),(16, 'もくひょう', 'C'), (16, 'はんだん',   'D'),
(17, 'ようなので', 'A'), (17, 'ためなので',  'B'), (17, 'からこそ',   'C'), (17, 'ものの',     'D'),
(18, 'じょうきょう','A'),(18, 'はんだん',   'B'), (18, 'えいきょう', 'C'), (18, 'やくわり',   'D'),
(19, 'に関して',   'A'), (19, 'に対して',   'B'), (19, 'によると',   'C'), (19, 'において',   'D'),
(20, '確かに嬉しかった','A'),(20,'確かに行きます','B'),(20,'確かにそうですね','C'),(20,'確かに食べません','D');

-- ─────────────────────────────────────────────
-- EXAM QUESTIONS - N2 (5 questions)
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO exam_questions (question_text, question_type, level, correct_answer, explanation, difficulty) VALUES
('技術の発展___、生活が便利になった。', 'grammar', 'N2', 'B', 'に伴って indica cambio simultáneo. "A medida que la tecnología avanzó, la vida se volvió más conveniente."', 4),
('「傾向」の意味はどれですか？', 'vocabulary', 'N2', 'A', '傾向 (けいこう) significa "tendencia".', 4),
('東京___、大阪や名古屋でも開催されます。', 'grammar', 'N2', 'C', 'をはじめ indica punto de partida como ejemplo representativo.', 4),
('「把握する」の意味はどれですか？', 'vocabulary', 'N2', 'D', '把握する (はあくする) significa "comprender", "captar" o "tener bajo control".', 4),
('「検討する」の意味として最も適切なものはどれですか？', 'vocabulary', 'N2', 'B', '検討する (けんとうする) significa "considerar", "examinar detenidamente".', 4);

INSERT OR IGNORE INTO exam_options (question_id, option_text, option_label) VALUES
(21, 'にとって',    'A'), (21, 'に伴って',   'B'), (21, 'において',    'C'), (21, 'をめぐって', 'D'),
(22, 'けいこう',    'A'), (22, 'しゅだん',   'B'), (22, 'とくちょう',  'C'), (22, 'こんきょ',   'D'),
(23, 'にたいして',  'A'), (23, 'にかんして', 'B'), (23, 'をはじめ',    'C'), (23, 'によって',   'D'),
(24, 'へらす',      'A'), (24, 'ふやす',     'B'), (24, 'さがす',      'C'), (24, 'はあくする', 'D'),
(25, 'あきらめる',  'A'), (25, 'けんとうする','B'),(25, 'やめる',       'C'), (25, 'むしする',   'D');

-- ─────────────────────────────────────────────
-- EXAM QUESTIONS - N1 (5 questions)
-- ─────────────────────────────────────────────
INSERT OR IGNORE INTO exam_questions (question_text, question_type, level, correct_answer, explanation, difficulty) VALUES
('本日___退職いたします。', 'grammar', 'N1', 'C', 'をもって es expresión formal que indica "a partir de" o "mediante". Aquí significa "a partir de hoy".', 5),
('「顕著」の意味はどれですか？', 'vocabulary', 'N1', 'A', '顕著 (けんちょ) significa "notable", "marcado" o "evidente".', 5),
('悪天候により、試合の中止を___。', 'grammar', 'N1', 'D', 'を余儀なくされる expresa verse obligado a hacer algo por circunstancias externas.', 5),
('「払拭する」の意味はどれですか？', 'vocabulary', 'N1', 'B', '払拭する (ふっしょくする) significa "disipar", "eliminar" o "borrar" (preocupaciones, dudas, etc.).', 5),
('今年は例年___暑い夏でした。', 'grammar', 'N1', 'C', 'にもまして significa "más que" o "por encima de". "Este verano fue más caluroso que en años normales."', 5);

INSERT OR IGNORE INTO exam_options (question_id, option_text, option_label) VALUES
(26, 'にかわって',       'A'), (26, 'をもとに',       'B'), (26, 'をもって',        'C'), (26, 'にわたって',    'D'),
(27, 'けんちょ',         'A'), (27, 'ぼうだい',        'B'), (27, 'しんちょう',      'C'), (27, 'けねん',        'D'),
(28, 'やむをえなかった', 'A'), (28, 'しかたなかった',  'B'), (28, 'いたしかたなかった','C'),(28, '余儀なくされた','D'),
(29, 'ふやす',           'A'), (29, 'ふっしょくする',  'B'), (29, 'へらす',          'C'), (29, 'けんとうする',  'D'),
(30, 'にたいして',       'A'), (30, 'にくらべて',      'B'), (30, 'にもまして',       'C'), (30, 'においても',    'D');
