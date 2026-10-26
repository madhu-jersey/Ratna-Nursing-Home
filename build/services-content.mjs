// Department page content. DRAFT: every medical statement here is pending doctor review.
// `[text]` inside a string renders as a labelled placeholder chip; `tbc` strings render as chips too.

export const CONTENT = {
  'general-medicine': {
    lead: 'Diagnosis and care for everyday and long-term illnesses, from a fever to diabetes, thyroid and blood pressure.',
    problems: [
      { icon: 'p-fever', title: 'Fever', notice: 'A high temperature, body pains, chills or tiredness, sometimes with a cough or loose motions.', why: 'Most fevers are the body fighting an infection, such as a viral illness, typhoid, malaria, dengue or a urine infection. A fever that lasts more than three days needs tests to find the cause.' },
      { icon: 'p-sugar', title: 'Diabetes (high sugar)', notice: 'Thirst, passing urine often, weight loss, tiredness, or wounds that heal slowly. Often there are no signs at all.', why: 'The body cannot use sugar properly, because it makes too little insulin or does not respond to it. Over the years, high sugar can damage the eyes, kidneys, nerves and heart.' },
      { icon: 'p-thyroid', title: 'Thyroid problems', notice: 'Weight change, tiredness, feeling too hot or too cold, hair fall, irregular periods or a swelling in the neck.', why: 'The thyroid gland in the neck sets the body\'s pace. When it makes too little or too much hormone, many parts of the body slow down or speed up.' },
      { icon: 'p-bp', title: 'High blood pressure', notice: 'Usually no symptoms. Sometimes headaches, giddiness or blurred vision.', why: 'Pressure in the blood vessels stays higher than it should. Left untreated, it strains the heart, brain and kidneys, which is why regular checks matter.' },
      { icon: 'p-lungs', title: 'Breathing problems', notice: 'A cough that will not settle, wheezing, breathlessness, or chest tightness.', why: 'Infections such as bronchitis and pneumonia, asthma, allergies and long-term smoking all narrow or inflame the airways.' },
      { icon: 'p-kidney', title: 'Kidney-related problems', notice: 'Swelling of the feet or face, burning or frequent urination, or changes found in a blood test.', why: 'Urine infections, stones, and long-standing diabetes or blood pressure can affect how well the kidneys filter the blood.' }
    ],
    emergency: {
      title: 'When to get help straight away',
      steps: [
        'Chest pain or pressure, especially with sweating or breathlessness: call 108 or go to the nearest emergency department at once.',
        'Sudden weakness or numbness of the face, arm or leg, or slurred speech: these can be signs of a stroke. Call 108 immediately.',
        'Severe breathlessness, a fit, or a person who is very drowsy or confused: call 108.',
        'Very high or very low sugar readings with drowsiness or confusion: get medical help straight away.',
        'A high fever with a rash, bleeding gums, severe headache or stiff neck: come in the same day.'
      ],
      note: null
    },
    causes: ['Infections from food, water and mosquitoes', 'Family history of diabetes or blood pressure', 'Little exercise and weight gain', 'Too much salt, sugar and oily food', 'Smoking and alcohol', 'Stress and poor sleep', 'Missed check-ups and medicines'],
    treatments: [
      { name: 'Consultation and check-up', involves: 'A full history, examination, and checks of blood pressure, pulse, temperature and weight.', recovery: 'No recovery needed.' },
      { name: 'Tests', involves: 'Blood and urine tests, an ECG, and a scan where needed, to find the cause and plan treatment.', recovery: 'Results are explained at a review visit.', tbc: 'Tests done on site to be confirmed' },
      { name: 'Long-term care for sugar, thyroid and BP', involves: 'Medicines, diet and activity advice, and a schedule of review visits and tests to keep the condition controlled.', recovery: 'An ongoing plan that is adjusted at each visit.' },
      { name: 'Inpatient care', involves: 'Admission to the ward for illnesses that need fluids, injections, oxygen or close watching.', recovery: 'Discharge once the doctor is satisfied, with a written summary and medicines.', tbc: 'Ward facilities to be confirmed' }
    ],
    expect: [
      'The doctor asks about your symptoms, medicines and family history, examines you, and suggests tests if needed.',
      'Treatment starts as an outpatient where possible. If you need closer care, the doctor will explain why and arrange admission.',
      'You leave with written advice and medicines, and a review date for long-term conditions.'
    ],
    faq: [
      ['Do I need to fast before a blood test?', 'Some tests, such as fasting sugar and cholesterol, need 8 to 10 hours without food. Water is fine. [Doctor to confirm which tests]'],
      ['Can diabetes be cured?', 'Type 2 diabetes is usually controlled rather than cured. Medicines, diet, activity and weight loss can keep sugar in a healthy range and prevent complications.'],
      ['How often should I check my blood pressure?', 'Your doctor will suggest how often based on your readings. [Recommended interval to be confirmed]'],
      ['Should I take antibiotics for every fever?', 'No. Many fevers are viral, and antibiotics do not help them. Take antibiotics only when a doctor prescribes them.']
    ]
  },

  'obstetrics-gynaecology': {
    lead: 'Care through pregnancy and childbirth, and for women\'s health at every age.',
    problems: [
      { icon: 'p-pregnant', title: 'Pregnancy care', notice: 'A missed period or a positive pregnancy test, and the questions that follow.', why: 'Regular check-ups through pregnancy watch the health of the mother and the baby\'s growth, and catch problems such as anaemia, high blood pressure or sugar early.' },
      { icon: 'p-calendar', title: 'Irregular periods', notice: 'Periods that come late, early, very far apart, or stop for months.', why: 'Hormone changes, PCOD, thyroid problems, weight change and stress can all upset the monthly cycle.' },
      { icon: 'p-pcod', title: 'PCOD / PCOS', notice: 'Irregular periods, weight gain, acne, extra facial hair, or difficulty getting pregnant.', why: 'A hormone imbalance in which the ovaries make many small follicles and release eggs irregularly. It is common and can be managed.' },
      { icon: 'p-pain', title: 'Heavy or painful periods', notice: 'Bleeding that soaks through pads quickly, clots, or pain that stops daily activity.', why: 'Fibroids, polyps, hormone changes or endometriosis can cause heavier or more painful periods.' },
      { icon: 'p-alert', title: 'White discharge and infections', notice: 'Discharge with itching, smell, burning, or pain in the lower abdomen.', why: 'Usually a treatable infection of the vagina or urinary tract. Repeated infections should be checked.' },
      { icon: 'p-time', title: 'Menopause changes', notice: 'Hot flushes, poor sleep, mood changes and irregular bleeding in the late 40s and 50s.', why: 'Hormone levels fall as the ovaries slow down. Any bleeding after periods have stopped for a year should be checked.' }
    ],
    emergency: {
      title: 'Warning signs in pregnancy',
      steps: [
        'Bleeding from the vagina, at any stage of pregnancy: come in or call straight away.',
        'Severe pain in the abdomen, or fluid leaking from the vagina.',
        'The baby moving less than usual in the later months.',
        'Severe headache, blurred vision, swelling of the face and hands, or fits: call 108 or go to the nearest emergency department.',
        'High fever, or labour pains before the 37th week.'
      ],
      note: 'Labour and emergency availability outside OPD hours to be confirmed with client.'
    },
    causes: ['Hormone imbalance', 'Thyroid problems', 'Weight gain or sudden weight loss', 'Anaemia and poor nutrition', 'Infections', 'Stress and irregular sleep', 'Family history'],
    treatments: [
      { name: 'Antenatal check-ups', involves: 'Regular visits to check blood pressure, weight, blood tests and the baby\'s growth, with scans at the recommended stages.', recovery: 'A schedule of visits through the pregnancy.' },
      { name: 'Electronic fetal monitoring', involves: 'A machine records the baby\'s heartbeat and the mother\'s contractions, to check the baby\'s well-being in late pregnancy and labour.', recovery: 'No recovery needed. Two soft belts are placed on the abdomen, no needles are used, and it takes about 20 to 40 minutes.', tbc: 'Usual duration to be confirmed' },
      { name: 'Delivery', involves: 'Care during labour and birth, normal or by caesarean section when needed, with care for mother and baby afterwards.', recovery: 'A hospital stay of a few days, longer after a caesarean.', tbc: 'Delivery facilities and stay length to be confirmed' },
      { name: 'PCOD management', involves: 'Blood tests and a scan, then diet and activity advice, and medicines to regulate periods and hormones.', recovery: 'Improvement over a few months of treatment.' },
      { name: 'Gynaecological procedures', involves: 'Treatment of fibroids, cysts and heavy bleeding, with medicines or surgery, including keyhole surgery where suitable.', recovery: 'Depends on the procedure.', tbc: 'Procedures offered to be confirmed' }
    ],
    expect: [
      'The doctor listens to your concern, asks about your periods and pregnancies, and examines you with a female attendant present.',
      'Tests or a scan are arranged if needed, and the doctor explains the findings and every option.',
      'You receive a treatment plan and review dates. In pregnancy, you get a schedule of visits and scans.'
    ],
    faq: [
      ['When should I first see a doctor in pregnancy?', 'As soon as you know you are pregnant, ideally in the first two to three months. Early visits check your health and start folic acid and other supplements.'],
      ['How many scans will I need?', 'Usually a few at set stages of pregnancy, and more if the doctor needs to check something. [Doctor to confirm the usual schedule]'],
      ['Can PCOD affect pregnancy?', 'PCOD can make it harder to conceive because eggs are released irregularly, but many women with PCOD get pregnant, sometimes with treatment.'],
      ['Is a normal delivery possible after a caesarean?', 'Sometimes. It depends on the reason for the first caesarean and how you and the baby are doing. [Doctor to confirm]']
    ]
  },

  ultrasound: {
    lead: 'Ultrasound scans for pregnancy, abdominal and pelvic problems, done and explained by your doctor.',
    problems: [
      { icon: 'p-pregnant', title: 'Scans in pregnancy', notice: 'Your doctor asks for a scan to check the pregnancy at a certain stage.', why: 'Scans confirm the pregnancy and due date, check the baby\'s growth, position and the placenta, and look for problems early.' },
      { icon: 'p-stomach', title: 'Pain in the abdomen', notice: 'Pain in the upper or lower abdomen, bloating, or vomiting.', why: 'A scan can show gallstones, kidney stones, an inflamed appendix, or problems of the liver, ovaries or uterus.' },
      { icon: 'p-pcod', title: 'Period and fertility problems', notice: 'Irregular or heavy periods, or difficulty getting pregnant.', why: 'A pelvic scan shows the uterus and ovaries, including fibroids, cysts, PCOD, and whether eggs are growing and being released.' },
      { icon: 'p-check', title: 'Follow-up of a known condition', notice: 'Your doctor wants to see whether a cyst, stone or other finding has changed.', why: 'Repeat scans show whether treatment is working or a condition is changing.' }
    ],
    causes: ['Routine pregnancy checks', 'Abdominal pain', 'Irregular or heavy periods', 'Difficulty conceiving', 'Urinary problems', 'Follow-up after treatment'],
    treatments: [
      { name: 'Obstetric (pregnancy) scan', involves: 'A scan over the abdomen, or sometimes internally in early pregnancy, to check the baby and the pregnancy.', recovery: 'No recovery needed.' },
      { name: 'Abdominal scan', involves: 'A probe with gel is moved over the abdomen to look at the liver, gall bladder, kidneys and other organs.', recovery: 'No recovery needed.' },
      { name: 'Pelvic scan', involves: 'A scan of the uterus and ovaries, over the abdomen or internally, depending on what the doctor needs to see.', recovery: 'No recovery needed.' },
      { name: 'Follicular monitoring', involves: 'A series of scans over a cycle to watch eggs grow and be released, for couples trying to conceive.', recovery: 'Several short visits during one cycle.' }
    ],
    expect: [
      'Your doctor explains why the scan is needed and how to prepare, for example with a full bladder or after fasting.',
      'The scan takes a few minutes. Gel is applied and a probe is moved over the skin. It does not use radiation.',
      'The doctor explains the findings and what happens next, and you receive a written report.'
    ],
    faq: [
      ['Is ultrasound safe in pregnancy?', 'Yes. Ultrasound uses sound waves, not X-rays, and is used routinely in pregnancy.'],
      ['Will the scan tell us the baby\'s sex?', 'No. Telling the sex of an unborn baby is against the law in India under the PC & PNDT Act, and it is not done at this hospital.'],
      ['Do I need a full bladder?', 'For some pelvic and early pregnancy scans, yes. Reception will tell you how to prepare when you book. [Preparation instructions to be confirmed]'],
      ['Do I need a doctor\'s referral for a scan?', '[To be confirmed with client]']
    ]
  },

  infertility: {
    lead: 'Tests and treatment for couples who are finding it hard to have a baby.',
    problems: [
      { icon: 'p-couple', title: 'Not conceiving', notice: 'A year of trying without pregnancy, or six months if the woman is over 35.', why: 'Conception needs a healthy egg, healthy sperm, open tubes and a receptive uterus. A problem with any of these, in either partner, can delay pregnancy.' },
      { icon: 'p-calendar', title: 'Irregular ovulation', notice: 'Irregular or absent periods.', why: 'If eggs are not released regularly, there are fewer chances each year to conceive. PCOD and thyroid problems are common causes.' },
      { icon: 'p-pcod', title: 'PCOD', notice: 'Irregular periods, weight gain or acne along with difficulty conceiving.', why: 'Hormone imbalance stops eggs from maturing and being released on time.' },
      { icon: 'p-pain', title: 'Tube and uterus problems', notice: 'Painful periods, past pelvic infections, or earlier surgery.', why: 'Blocked tubes, fibroids, polyps or endometriosis can stop the egg and sperm from meeting, or the embryo from settling.' },
      { icon: 'p-time', title: 'Age and repeated loss', notice: 'Trying later in life, or more than one miscarriage.', why: 'Egg numbers and quality fall with age, especially after 35. Repeated loss needs tests for both partners.' }
    ],
    causes: ['PCOD and hormone imbalance', 'Thyroid problems', 'Blocked fallopian tubes', 'Fibroids and endometriosis', 'Low sperm count or movement', 'Age', 'Weight, smoking and alcohol'],
    treatments: [
      { name: 'Evaluation of both partners', involves: 'History, examination, blood tests for hormones, a pelvic scan for the woman, and a semen test for the man.', recovery: 'No recovery needed. Results are explained together.' },
      { name: 'Ovulation induction', involves: 'Tablets or injections help eggs grow and be released, with scans to time intercourse.', recovery: 'A few visits in each treatment cycle.' },
      { name: 'Follicular monitoring', involves: 'Repeat scans across the cycle to see when an egg is ready.', recovery: 'Short visits over one to two weeks.' },
      { name: 'IUI (intrauterine insemination)', involves: 'Prepared sperm is placed in the uterus at the time of ovulation, through a thin tube.', recovery: 'Usual activities the same day.', tbc: 'Whether IUI is offered to be confirmed' },
      { name: 'Laparoscopy for fertility', involves: 'Keyhole surgery to check the tubes and treat cysts, endometriosis or adhesions.', recovery: 'Usually home within a day or two.', tbc: 'To be confirmed by doctor' }
    ],
    expect: [
      'Both partners meet the doctor together. The doctor asks about your history and plans the first tests.',
      'Tests are done over one or two cycles. The doctor then explains the cause, if one is found, and the treatment options.',
      'Treatment goes ahead cycle by cycle, with scans and reviews, and the plan is adjusted as needed.'
    ],
    faq: [
      ['Should both partners be tested?', 'Yes. Problems on the man\'s side are found in many couples, so both partners are evaluated from the start.'],
      ['How long before treatment works?', 'It differs for every couple. Many conceive within a few cycles of treatment. [Doctor to confirm]'],
      ['Do you offer IVF?', '[To be confirmed with client]'],
      ['Can lifestyle changes help?', 'Yes. A healthy weight, stopping smoking and alcohol, and treating sugar or thyroid problems can improve the chances of pregnancy.']
    ]
  },

  'laparoscopic-surgery': {
    lead: 'Keyhole operations through small cuts, for less pain, a shorter stay and a quicker return to normal life.',
    problems: [
      { icon: 'p-pcod', title: 'Ovarian cysts', notice: 'Pain on one side of the lower abdomen, or a cyst seen on a scan.', why: 'Fluid-filled sacs can form on the ovary. Most go away by themselves, but large, painful or persistent cysts may need removal.' },
      { icon: 'p-pain', title: 'Fibroids and heavy bleeding', notice: 'Heavy or long periods, pressure in the lower abdomen, or a swelling seen on a scan.', why: 'Fibroids are non-cancerous growths of the uterus muscle. Some are small and need no treatment; others cause symptoms.' },
      { icon: 'p-stone', title: 'Gallstones', notice: 'Pain in the upper right abdomen after oily food, with nausea or vomiting.', why: 'Stones form in the gall bladder from bile. Repeated attacks are a reason to remove the gall bladder.' },
      { icon: 'p-stomach', title: 'Appendicitis', notice: 'Pain that starts around the navel and moves to the lower right, with fever and vomiting.', why: 'The appendix becomes blocked and inflamed. It usually needs an operation.' },
      { icon: 'p-hernia', title: 'Hernia', notice: 'A bulge in the groin or near the navel that grows when you cough or lift.', why: 'Part of the bowel or fat pushes through a weak area of the abdominal wall.' }
    ],
    causes: ['Hormone changes', 'Repeated infections', 'Oily food and weight gain (gallstones)', 'Heavy lifting and constant coughing (hernia)', 'Earlier operations', 'Family history'],
    treatments: [
      { name: 'Diagnostic laparoscopy', involves: 'A thin camera is passed through a small cut near the navel to look inside the abdomen and pelvis.', recovery: 'Usually home the same or next day.', tbc: 'To be confirmed by doctor' },
      { name: 'Ovarian cystectomy', involves: 'The cyst is removed while keeping the healthy part of the ovary.', recovery: 'A short hospital stay and light activity for a week or two.', tbc: 'To be confirmed by doctor' },
      { name: 'Laparoscopic hysterectomy and myomectomy', involves: 'Removal of the uterus, or of fibroids alone, through small cuts.', recovery: 'A few days in hospital, then several weeks of gradual return to activity.', tbc: 'Procedures offered to be confirmed' },
      { name: 'Gall bladder and appendix removal', involves: 'The gall bladder or appendix is removed through three or four small cuts.', recovery: 'Usually home within one to two days.', tbc: 'Procedures offered to be confirmed' },
      { name: 'Hernia repair', involves: 'The weak area is closed and usually strengthened with a mesh.', recovery: 'Avoid heavy lifting for a few weeks.', tbc: 'To be confirmed by doctor' }
    ],
    expect: [
      'The surgeon examines you, reviews your scan and tests, and explains the operation, its risks and the alternatives, including not operating.',
      'The operation is done under anaesthesia through small cuts. Most patients walk the same or next day.',
      'You go home with wound care advice and medicines, and a review visit checks healing.'
    ],
    faq: [
      ['Is laparoscopic surgery better than open surgery?', 'For many operations it means smaller scars, less pain and a quicker recovery. It is not suitable for everyone, and sometimes an operation has to be changed to open surgery for safety.'],
      ['Will I need general anaesthesia?', 'Most laparoscopic operations are done under general anaesthesia. [Doctor to confirm]'],
      ['How long will I stay in hospital?', '[To be confirmed by doctor: depends on the operation]'],
      ['When can I go back to work?', 'Many people return to light work within one to two weeks. Your surgeon will advise based on the operation and your job.']
    ]
  }
};
