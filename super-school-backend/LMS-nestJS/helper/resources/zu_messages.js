"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zu = void 0;
exports.zu = {
    USER_EXIST: "Umsebenzisi usukhona.",
    USER_CREATED_SUCCESS: "Umsebenzisi wenziwe ngempumelelo.",
    USERS_LIST_SUCCESS: "Uhlu lwabasebenzisi lutholakele ngempumelelo.",
    NO_USERS_FOUND: "Umsebenzisi akatholakali.",
    USER_DETAILS: "Imininingwane yomsebenzisi itholakele ngempumelelo.",
    USER_UPDATED_SUCCESS: "Umsebenzisi uvuselelwe ngempumelelo.",
    USER_DELETED_SUCCESS: "Umsebenzisi ususwa ngempumelelo.",
    LANGUAGE_CODE_REQUIRED: "Sicela ufake ikhodi yolimi.",
    INSTITUTE_CREATED: "Isikhungo senziwe ngempumelelo.",
    INSTITUTE_ALREADY_EXISTS: "Isikhungo sesivele sikhona.",
    UNIQUE_EMIS_NUMBER: "Please ensure the EMIS number is unique, as this one has already been added.",
    UNIQUE_ADMISSION_NO: "Please ensure the Admission number is unique, as this one has already been added.",
    INSTITUTE_LIST: "Uhlu lwesikhungo lutholakele ngempumelelo.",
    NO_INSTITUTES_FOUND: "Isikhungo asitholakali.",
    INSTITUTE_DETAILS: "Imininingwane yesikhungo itholakele ngempumelelo.",
    INSTITUTE_UPDATED_SUCCESS: "Isikhungo sivuselelwe ngempumelelo.",
    INSTITUTE_UPDATE_FAILED: "Kukhona okungalungile ngesikhathi kuvuselelwa isikhungo.",
    INSTITUTE_DELETED_SUCCESS: "Isikhungo susiwe ngempumelelo.",
    STATE_LIST: "Uhlu lwezindawo lutholakele ngempumelelo.",
    NO_STATES_FOUND: "Indawo ayitholakali.",
    ROLE_LIST: "Uhlu lwezindima lutholakele ngempumelelo.",
    ROLE_LIST_ERROR: "Uhlu lwezindima alutholakali.",
    ROLE_DETAILS: "Imininingwane yezindima itholakele ngempumelelo.",
    ROLE_NOT_FOUND: "Indima ayitholakali.",
    ROLE_UPDATED_SUCCESS: "Indima ivuselelwe ngempumelelo.",
    ROLE_UPDATE_ERROR: "Kukhona okungalungile ngesikhathi kuvuselelwa indima.",
    ROLE_DELETED_SUCCESS: "Indima susiwe ngempumelelo.",
    CITY_LIST: "Uhlu lwezinqaba lutholakele ngempumelelo.",
    NO_CITIES_FOUND: "Isixeko asitholakali.",
    CITIES_RETRIEVED: "Izixeko zitholakele ngempumelelo.",

    // --------------------------------
    BATCH_LIST: "Uhlu lweminyaka lutholwe ngempumelelo.",
    BATCH_CREATED: "Unyaka wenziwe ngempumelelo.",
    BATCH_LIST_ERROR: "Uhlu lweminyaka alutholakali.",
    BATCH_NOT_FOUND: "Unyaka awutholakali.",
    BATCH_UPDATED_SUCCESS: "Unyaka uvuselelwe ngempumelelo.",
    BATCH_UPDATE_ERROR: "Kube nenkinga ngesikhathi kuvuselelwa unyaka.",
    BATCH_ALREADY_EXISTS: "Unyaka usukhona.",
    BATCH_DELETED_SUCCESS: "Unyaka usususiwe ngempumelelo.",
    BATCH_DELETE_ERROR: "Kukhona okungalungile ngesikhathi suswa indima.",

    // --------------------------------
    ASSESSMENT_CREATED: "Ukuhlola kudalwe ngempumelelo",
    ASSESSMENTS_FETCHED: "Ukuhlola kudalwe ngempumelelo",
    NO_ASSESSMENTS_FOUND: "Akukho ukuhlaziya okutholiwe",
    ASSESSMENT_UPDATED: "Ukuhlola kubuyekezwe ngempumelelo",
    ASSESSMENT_DELETED: "Ukuhlola kususwe ngempumelelo",

    // --------------------------------
    EXAM_ALREADY_EXISTS_IN_DIVISION: "Uhlolo selukhona emkhakheni.",
    EXAM_CREATED_SUCCESS: "Uhlolo lwenziwe ngempumelelo.",
    EXAM_DELETED_ERROR: "Uhlolo lususwe ngokwephutha.",
    FETCHED_EXAMS_SUCCESS: "Uhlolo lutholakele ngempumelelo.",
    NO_EXAMS_FOUND: "Uhlolo alutholakali.",
    EXAM_NOT_FOUND: "Uhlolo alutholakali.",
    EXAM_UPDATED_SUCCESS: "Uhlolo luvuselelwe ngempumelelo.",
    EXAM_DELETED_SUCCESS: "Uhlolo lususwe ngempumelelo.",

    // ----------------------------
    MODULE_CREATED: "Imodyuli yenziwe ngempumelelo.",
    MODULE_ALREADY_EXISTS: "Imodyuli isivele ikhona.",
    MODULE_LIST: "Uhlu lwezimo lutholakele ngempumelelo.",
    NO_MODULES_FOUND: "Izimo azitholakali.",
    MODULE_DETAILS: "Imininingwane yemodyuli itholakele ngempumelelo.",
    MODULE_UPDATED_SUCCESS: "Imodyuli ivuselelwe ngempumelelo.",
    MODULE_NOT_FOUND: "Imodyuli ayitholakali.",
    MODULE_UPDATE_FAILED: "Kukhona okungalungile ngesikhathi kuvuselelwa imodyuli.",
    MODULE_DELETED_SUCCESS: "Imodyuli susiwe ngempumelelo.",

    // ----------------------------
    TOKEN_EXPIRED: "I-Tokheni iphelelwe isikhathi.",
    INVALID_TOKEN: "I-Tokheni engalungile.",
    AUTHORIZATION_TOKEN_NOT_PROVIDED: "I-AUTHORIZATION_TOKEN_AYIKAHLAKAZIWA.",
    LOGIN_SUCCESS: "Ugenile ngempumelelo.",

    // ----------------------------
    TEACHER_ALREADY_EXISTS: "Uthisha usukhona.",
    TEACHER_CREATED: "Uthisha wenziwe ngempumelelo.",
    TEACHER_LIST: "Uhlu lothisha lutholakele ngempumelelo.",
    TEACHER_LIST_ERROR: "Kukhona okungalungile ngesikhathi kutholwa uhlu lothisha.",
    TEACHER_DETAILS: "Imininingwane yothisha itholakele ngempumelelo.",
    TEACHER_NOT_FOUND: "Uthisha akatholakali.",
    TEACHER_UPDATED_SUCCESS: "Uthisha uvuselelwe ngempumelelo.",
    TEACHER_UPDATE_ERROR: "Kukhona okungalungile ngesikhathi kuvuselelwa uthisha.",
    TEACHER_DELETED_SUCCESS: "Uthisha ususwe ngempumelelo.",

    // ----------------------------
    DEFAULT: "Isenzo senziwe ngempumelelo.",
    DEFAULT_AUTH: "Umsebenzisi akavunyelwe.",
    DEFAULT_INTERNAL_SERVER_ERROR: "Iphutha elisemva komkhawulo.",
    SERVER_ERROR: "Kukhona okungalungile, sicela zama futhi.",
    FORGOT_PASSWORD_SUCCESS: "Sithumele isixhumanisi sokubuyisela iphasiwedi kwi-imeyili yakho.",
    PASSWORD_RESET_SUCCESS: "Iphasiwedi ivuselelwe ngempumelelo. Sicela uzame ukuphinda ungene futhi.",

    // ----------------------------
    GRADE_ALREADY_EXISTS: "I-Grade isivele ikhona.",
    GRADE_CREATED: "I-Grade idalwe ngempumelelo.",
    GRADE_LIST: "Uhlu lwezinga lutholakele ngempumelelo.",
    GRADE_LIST_ERROR: "Kukhona okungahambi kahle ngenkathi kutholakala uhlu lwezinga.",
    GRADE_DETAILS: "Imininingwane ye-Grade itholakele ngempumelelo.",
    GRADE_NOT_FOUND: "I-Grade ayitholakali.",
    GRADE_UPDATED_SUCCESS: "I-Grade ivuselelwe ngempumelelo.",
    GRADE_UPDATE_ERROR: "Kukhona okungahambi kahle ngenkathi kuvuselelwa izinga.",
    GRADE_DELETED_SUCCESS: "I-Grade isusiwe ngempumelelo.",

    // ----------------------------
    TOTAL_STUDENTS: "Inani eliphelele labafundi litholakale ngempumelelo.",
    TOTAL_TEACHERS: "Inani eliphelele labafundisi litholakale ngempumelelo.",
    TOTAL_INSTITUTES: "Inani eliphelele lezikhungo litholakale ngempumelelo.",

    // ----------------------------
    PARENT_ALREADY_EXISTS: "Abazali bavele bakhona.",
    PARENT_CREATED: "Abazali bakhiwe ngempumelelo.",
    PARENT_LIST: "Uhlu lwabazali lutholakele ngempumelelo.",
    PARENT_LIST_ERROR: "Kukhona okungahambi kahle ngenkathi kutholakala uhlu lwabazali.",
    PARENT_DETAILS: "Imininingwane yabazali itholakele ngempumelelo.",
    PARENT_NOT_FOUND: "Abazali abatholakali.",
    PARENT_UPDATED_SUCCESS: "Abazali bavuselelwe ngempumelelo.",
    PARENT_UPDATE_ERROR: "Kukhona okungahambi kahle ngenkathi kuvuselelwa abazali.",
    PARENT_DELETED_SUCCESS: "Abazali basusiwe ngempumelelo.",

    // ----------------------------
    STUDENT_ALREADY_EXISTS: "Umfundi usukhona.",
    STUDENT_CREATED: "Umfundi udalwe ngempumelelo.",
    STUDENT_LIST: "Uhlu lwabafundi lutholakele ngempumelelo.",
    STUDENT_LIST_ERROR: "Kukhona okungahambi kahle ngenkathi kutholakala uhlu lwabafundi.",
    STUDENT_DETAILS: "Imininingwane yomfundi itholakele ngempumelelo.",
    STUDENT_NOT_FOUND: "Umfundi akatholakali.",
    STUDENT_UPDATED_SUCCESS: "Umfundi uvuselelwe ngempumelelo.",
    STUDENT_UPDATE_ERROR: "Kukhona okungahambi kahle ngenkathi kuvuselelwa umfundi.",
    STUDENT_DELETED_SUCCESS: "Umfundi ususiwe ngempumelelo.",

    // ----------------------------

    SUBJECT_ALREADY_EXISTS: "Isihloko esikhulu sesivele sikhona.",
    SUBJECT_CREATED: "Isihloko esikhulu sidalwe ngempumelelo.",
    SUBJECT_LIST: "Uhlu lwezihloko ezikhulu lutholwe ngempumelelo.",
    SUBJECT_LIST_ERROR: "Kwenzeke iphutha ngenkathi kutholwa uhlu lwezihloko ezikhulu.",
    SUBJECT_DETAILS: "Imininingwane yesihloko esikhulu itholwe ngempumelelo.",
    SUBJECT_NOT_FOUND: "Isihloko esikhulu asitholakalanga.",
    SUBJECT_UPDATED_SUCCESS: "Isihloko esikhulu sibuyekezwe ngempumelelo.",
    SUBJECT_UPDATE_ERROR: "Kwenzeke iphutha ngenkathi kuvuselelwa isihloko esikhulu.",
    SUBJECT_DELETED_SUCCESS: "Isihloko esikhulu sisusiwe ngempumelelo.",
    NO_NEW_SUBJECTS_CREATED: "Akukho sihloko esikhulu esisha esidalwe.",
    NO_SUBJECTS_FOUND: "Isihloko esikhulu asitholakalanga.",
    // ----------------------------
    ADMIN_ALREADY_EXISTS: "Umphathi Wesikole usevele ukhona",
    ADMIN_CREATED: "Umphathi wesikole udalwe ngempumelelo.",
    ADMIN_LIST: "Bonke abaphathi besikole balandwe ngempumelelo.",
    ADMIN_LIST_ERROR: "Kukhona okungahambanga kahle ngesikhathi silanda uhlu lwabaphathi besikole.",
    ADMIN_DETAILS: "Imininingwane yomqondisi wesikole ilandwe ngempumelelo.",
    ADMIN_NOT_FOUND: "Akekho umphathi Wesikole otholelwe isicelo esinikeziwe",
    ADMIN_UPDATED_SUCCESS: "Umphathi wesikole ubuyekezwe ngempumelelo.",
    ADMIN_UPDATE_ERROR: "Kukhona okungahambanga kahle ngenkathi kubuyekezwa umqondisi wesikole.",
    ADMIN_DELETED_SUCCESS: "Umphathi wesikole ususwe ngempumelelo.",

    // --------------------------------------------------
    DIVISION_ALREADY_EXISTS: "Ikilasi selivele likhona.",
    DIVISION_CREATED: "Ikilasi lidalwe ngempumelelo.",
    DIVISION_LIST: "Uhlu lwezikilasi lutholiwe ngempumelelo.",
    DIVISION_LIST_ERROR: "Kunenkinga eyenzekile ngenkathi kutholwa uhlu lwezikilasi.",
    DIVISION_DETAILS: "Imininingwane yekilasi itholiwe ngempumelelo.",
    DIVISION_NOT_FOUND: "Ikilasi alitholakalanga.",
    DIVISION_UPDATED_SUCCESS: "Ikilasi libuyekezwe ngempumelelo.",
    DIVISION_UPDATE_ERROR: "Kunenkinga eyenzekile ngenkathi kubuyekezwa ikilasi.",
    DIVISION_DELETED_SUCCESS: "Ikilasi lisusiwe ngempumelelo.",

    // ----------------------------------------
    INSTITUTE_ID_REQUIRED: "Id yeNstututhi iyadingeka.",
    THEME_COLOR_ALREADY_CHANGED: "Umbala wesikh主题 ushintshile.",
    ACCESS_DENIED: "Ukungena kuyavinjwa.",
    THEME_COLOR_UPDATED: "Umbala wesikh主题 uphumelele ukushelwa.",
    NO_FILE_UPLOADED: "Ayikho ifayela elilayishiwe.",
    USER_ID_NOT_FOUND: "Id yomsebenzisi ayitholakali.",
    PROFILE_IMAGE_UPLOADED_SUCCESS: "Isithombe sephrofayela sithunyelwe ngempumelelo.",
    IMAGE_UPLOADED_SUCCESSFULLY: "Isithombe sithunyelwe ngempumelelo.",
    IMAGE_UPLOAD_FAILED: "Ukuthunyelwa kwesithombe kwehlulekile. Ngiyacela uzame futhi.",

    // ----------------------------
    PERMISSION_ALREADY_EXISTS: "Imvume isivele ikhona.",
    PERMISSION_CREATED: "Imvume isidale ngempumelelo.",
    PERMISSION_LIST: "Uhlu lwemvume lutholwe ngempumelelo.",
    NO_PERMISSIONS_FOUND: "Ayikho imvume etholakele.",
    PERMISSION_DETAILS: "Imininingwane yemvume itholwe ngempumelelo.",
    PERMISSION_UPDATED_SUCCESS: "Imvume ibuyekeziwe ngempumelelo.",
    PERMISSION_NOT_FOUND: "Imvume ayitholakalanga.",
    PERMISSION_DELETED_SUCCESS: "Imvume isuswe ngempumelelo.",

    // ----------------------------
    DIVISION_SUBJECT_ALREADY_EXISTS: "Ubudlelwano be-division-subject sebukhona.",
    DIVISION_SUBJECT_CREATED: "Ubudlelwano be-division-subject buphumelele ukudalwa.",
    DIVISION_SUBJECT_LIST: "Uhlu lwezibalo ze-division-subject luzitholile ngempumelelo.",
    DIVISION_SUBJECT_DETAILS: "Imininingwane yobudlelwano be-division-subject itholiwe ngempumelelo.",
    DIVISION_SUBJECT_NOT_FOUND: "Ubudlelwano be-division-subject abutholakele.",
    DIVISION_SUBJECT_UPDATED_SUCCESS: "Ubudlelwano be-division-subject buphumelele ukuvuselelwa.",
    DIVISION_SUBJECT_UPDATE_ERROR: "Iphutha ekuvuselelweni kobudlelwano be-division-subject. Sicela uzame futhi.",
    DIVISION_SUBJECT_DELETED_SUCCESS: "Ubudlelwano be-division-subject buphumelele ukususwa.",
    DIVISION_SUBJECT_NOT_ASSIGN: "Lesi sifundo asikabiqokiwe komunye uthisha. Ngicela uqale usiqokele uthisha ngaphambi kokusisusa.",

    // ----------------------------
    TERM_ALREADY_EXISTS: "Isikhathi sesivele sikhona",
    TERM_CREATED: "Isikhathi senziwe ngempumelelo.",
    TERM_LIST: "Uhlu lwamashumi lutholwe ngempumelelo.",
    TERM_DETAILS: "Imininingwane yesikhathi itholiwe ngempumelelo.",
    TERM_NOT_FOUND: "Isikhathi esifunwayo asitholakalanga.",
    TERM_UPDATED_SUCCESS: "Isikhathi sihlaziywe ngempumelelo.",
    TERM_DELETED_SUCCESS: "Isikhathi sisusiwe ngempumelelo.",

    // ----------------------------
    INVALID_EMAIL: "Ikheli le-imeyili onikezile alikho emthethweni. Sicela ufake ikheli le-imeyili elivumelekile.",
    INVALID_PASSWORD: "Iphasiwedi onikezile ayilungile. Sicela uzame futhi.",
    USER_NOT_FOUND: "Umsebenzisi akatholakalanga. Sicela uhlole iziqinisekiso futhi uzame futhi.",
    PASSWORD_NOT_SET: "Iphasiwedi ayizange ibekwe kule akhawunti. Sicela usebenzise isixhumanisi ku-imeyili yakho yokwamukela ukuze usethe iphasiwedi entsha.",
    PASSWORD_CREATED_SUCCESSFULLY: "Iphasiwedi idalwe ngempumelelo. Sicela uqhubeke nokungena usebenzisa iphasiwedi yakho entsha edaliwe.",
    PASSWORD_UPDATED: "Iphasiwedi ibuyekezwe ngempumelelo. Sicela uqhubeke nokungena usebenzisa iphasiwedi yakho entsha ebuyekeziwe.",
    USER_NOT_LONGER_EXIST: "I-akhawunti yakho ayisasebenzi. Sicela uthinte usizo ukuze uthole usizo olunye.",

    // ----------------------------
    EVENT_CREATED: "Umcimbi udalwe ngempumelelo.",
    EVENT_CREATION_FAILED: "Kwaphuthelwa ukudala umcimbi. Sicela uzame futhi kamuva.",
    EVENT_UPDATED: "Umcimbi uphucuziwe ngempumelelo.",
    EVENT_NOT_FOUND: "Umcimbi awutholakali. Sicela uhlole i-ID yomcimbi bese uzama futhi.",
    EVENT_UPDATE_FAILED: "Kwaphuthelwa ukuphucula umcimbi. Sicela uzame futhi kamuva.",
    EVENT_DELETED: "Umcimbi ususiwe ngempumelelo.",
    EVENT_DELETION_FAILED: "Kwaphuthelwa ukususa umcimbi. Sicela uzame futhi kamuva.",
    EVENT_LIST: "Uhlu lwezemicimbi lutholakele ngempumelelo.",
    EVENT_LIST_FAILED: "Kwaphuthelwa ukuthola uhlu lwezemicimbi. Sicela uzame futhi kamuva.",

    // ----------------------------
    MISSING_BATCH_OR_GRADE_ID: "Id ID yeNyanga neGredi ID kuyadingeka ukulayisha iphepha lombuzo.",
    GRADE_OR_BATCH_NOT_FOUND: "Ayikho iGredi noma iNyanga etholakele ngezikhombisi ezihlinzekiwe.",
    INVALID_GRADE_OR_BATCH_INFO: "Ulwazi lweGredi noma lweNyanga olungamukelekanga olunikeziwe.",

    // ----------------------------
    INVALID_FILE_TYPE: "Ayikho ifayela elilayishwe noma uhlobo lwefayela alulungile. Sicela ulayishe ifayela elilungile.",
    FAILED_TO_SAVE_DATABASE: "Kwaphutha ukulondoloza iphepha lombuzo ku-database. Sicela uzame futhi kamuva.",
    PAPER_CREATED_SUCCESS: "I-PDF ilayishwe ngempumelelo.",
    PAPER_FOUND: "Iphuzu lombuzo litholakele.",
    PAPER_NOT_FOUND: "Iphuzu lombuzo alitholakali. Sicela uqinisekise ukuthi i-ID yephepha ilungile.",
    OLD_QUESTION_PAPER_DELETED_SUCCESS: "Iphepha lombuzo elidala lisusiwe ngempumelelo.",
    PAPER_LIST_FOUND: "Uhlu lwephepha lombuzo lutholakele ngempumelelo.",
    PAPER_LIST_NOT_FOUND: "Awekho amaphepha wombuzo atholakele. Sicela uhlole idatha bese uzama futhi.",
    PAPER_UPDATED_SUCCESSFULLY: "I-pdf yephepha elidala ivuselelwe ngempumelelo.",
    INVALID_CURRENT_PASSWORD: "Iphasiwedi yakho yangoku oyifakile ayilungile.",
    PASSWORD_CHANGE_SUCCESS: "Iphasiwedi yakho ishintshwe ngempumelelo.",

    // ----------------------------
    NOTIFICATION_CREATED: "Isaziso sidalwe ngempumelelo.",
    NOTIFICATION_LIST: "Uhlu lwezaziso lutholwe ngempumelelo.",
    NO_NOTIFICATIONS_FOUND: "Azikho izaziso ezitholakele.",
    NOTIFICATION_DETAILS: "Imininingwane yesaziso itholwe ngempumelelo.",
    NOTIFICATION_UPDATED: "Isaziso sibuyekeziwe ngempumelelo.",
    NOTIFICATION_DELETED: "Isaziso sisusiwe ngempumelelo.",

    // ----------------------------
    MODULE_DELETED: "I-Module isusiwe ngempumelelo.",
    INSTITUTE_NOT_FOUND: "Isikhungo asitholakali.",
    INVALID_PARENTS_DATA: "Idatha yabazali ayifanele.",
    NO_ACTIVE_BATCH_FOUND: "Ayikho iminyaka esebenzayo etholekile. Sicela uvuselele unyaka kuqala.",
    BATCH_ACTIVATED_SUCCESSFULLY: "Unyaka uvele umisiwe ngempumelelo.",
    GRADES_NOT_FOUND: "Igrade ayitholakalanga!",
    OLD_TERM_NOT_FOUND: "Isikhathi esidala asitholakalanga",

    // ----------------------------
    DEPARTMENT_USER_ALREADY_EXISTS: "Umphathi womnyango usuvele ukhona ohlelweni.",
    DEPARTMENT_USER_CREATED: "Umphathi womnyango udalwe ngempumelelo.",
    DEPARTMENT_USER_LIST: "Umphathi womnyango utholwe ngempumelelo.",
    DEPARTMENT_USER_LIST_ERROR: "Kube nephutha ngenkathi kutholwa uhlu lwabaphathi bomnyango.",
    DEPARTMENT_USER_DETAILS: "Imininingwane yomphathi womnyango itholwe ngempumelelo.",
    DEPARTMENT_USER_NOT_FOUND: "Umphathi womnyango oceliwe awutholakalanga.",
    DEPARTMENT_USER_UPDATED: "Umphathi womnyango ubuyekezwe ngempumelelo.",
    DEPARTMENT_USER_UPDATE_FAILED: "Yehlulekile ukuvuselela umphathi womnyango.",
    DEPARTMENT_USER_DELETE_SUCCESS: "Umphathi womnyango ususwe ngempumelelo.",

    // ----------------------------
    ASSESSMENTS_FETCHED: "Uhlu lwezivivinyo lutholakele ngempumelelo.",
    NO_ASSESSMENTS_FOUND: "Ayikho izivivinyo ezitholakele.",
    ASSESSMENT_SUBJECTS_FETCHED: "Uhlu lwezihloko zezivivinyo lutholakele ngempumelelo.",
    NO_ASSESSMENT_SUBJECTS_FOUND: "Ayikho izihloko zezivivinyo ezitholakele.",
    MANUAL_MARKINGS_FETCHED: "Uhlu lokubhalwa kwezemanuallutholakele ngempumelelo.",
    NO_MANUAL_MARKINGS_FOUND: "Ayikho ukubhalwa kwezemanuallutholakele.",
    STUDENT_ANSWER_SHEETS_FETCHED: "Uhlu lwezincwadi zempendulo zabafundi lutholakele ngempumelelo.",
    NO_STUDENT_ANSWER_SHEETS_FOUND: "Ayikho izincwadi zempendulo zabafundi ezitholakele.",
    DIGITAL_MARKINGS_FETCHED: "Uhlu lokubhalwa kwezezimali kwedijithali lutholakele ngempumelelo.",
    NO_DIGITAL_MARKINGS_FOUND: "Ayikho ukubhalwa kwezezimali kwedijithali okutholakele.",

    // ---------------------------
    INVALID_DIVISION_ID: "Indi balido nga mga id sang dibisyon",
    MAXIMUM_GRADE_ALLOWED_TO_BE: "maximum 1 ka grado nga tugutan para sa klase sang sahi",
    DIVISION_ID_REQUIRED: "Ang 'division_id' nga field kinahanglanon kag dapat isa ka array sang mga ID sang dibisyon.",
    GRADE_ID_REQUIRED: "Ang 'grade_id' nga field kinahanglanon kag dapat isa ka array sang mga grade ID.",
    EVENT_DETAIL: "Ang detalye sang hitabo madinalag-on nga nakuha",
    EVENT_DETAIL_FAILED: "Napaslawan sa pagkuha sang detalye sang hitabo. Palihog tilawi liwat sa ulihi.",
    DATA_NOT_FOUND: "Wala makita ang datos",
    DATA_UPDATED: "Madinalag-on nga na-update ang datos",

    // ---------------------------
    LESSON_PLAN_CREATED: "Ang plano sang leksyon nahimo sing madinalag-on",
    LESSON_PLAN_UPDATED: "Ang plano sang leksyon madinalag-on nga gin-update",
    LESSON_PLAN_FETCHED: "Ang plano sang leksyon madinalag-on nga nakuha",
    LESSON_PLAN_LIST: "Ang listahan sang plano sang leksyon madinalag-on nga nakuha",
    LESSON_PLAN_DELETED: "Ang plano sang leksyon madinalag-on nga ginpanas",
    LESSON_PLAN_DETAILS: "Ang mga detalye sang plano sang leksyon madinalag-on nga nakuha",
    LESSON_PLAN_NOT_FOUND: "Wala makita ang plano sang leksyon",

    // ----------------------------
    NOT_AUTHORIZED_TO_DELETE_EVENT: "Indi ka awtorisado sa pagdula sini nga hitabo.",
    EVENT_NOT_FOUND: "Wala makita ang datos",

    // ---------------------------
    TEXTBOOK_GUIDES_CREATED: "Izincwadi nezindatshana zengezwe ngempumelelo.",
    TEXTBOOK_GUIDES_LIST: "Uhlu lwezincwadi nezindatshana lubuyiswe ngempumelelo.",
    TEXTBOOK_GUIDES_DETAILS: "Imininingwane yezincwadi nezindatshana ibuyiselwe ngempumelelo.",
    TEXTBOOK_GUIDES_NOT_FOUND: "Imininingwane yezincwadi nezindatshana ayitholakali.",
    TEXTBOOK_GUIDES_UPDATED: "Izincwadi nezindatshana zibuyekezwe ngempumelelo.",
    TEXTBOOK_GUIDES_DELETED: "Izincwadi nezindatshana zisuswe ngempumelelo.",

    // ---------------------------
    OLD_QUESTION_PAPER_AND_MEMO_CREATED: "Iphepha Lemibuzo Elidala neMemo kwengezwe ngempumelelo.",
    OLD_QUESTION_PAPER_AND_MEMO_LIST: "Amaphepha emibuzo amadala namaMemo abuyiswe ngempumelelo.",
    OLD_QUESTION_PAPER_AND_MEMO_DETAILS: "Iphepha Lemibuzo Elidala kanye nemininingwane yeMemo ibuyiswe ngempumelelo.",
    OLD_QUESTION_PAPER_AND_MEMO_NOT_FOUND: "Iphepha Lemibuzo Elidala kanye nemininingwane yeMemo ayitholakali.",
    OLD_QUESTION_PAPER_AND_MEMO_UPDATED: "Iphepha Lemibuzo Elidala neMemo zibuyekezwe ngempumelelo.",
    OLD_QUESTION_PAPER_AND_MEMO_DELETED: "Iphepha Lemibuzo Elidala neMemo kususwe ngempumelelo.",

    // --------------------------
    DOCUMENTS_CREATED: "Idokhumenti noma Isixhumanisi sengezwe ngempumelelo.",
    DOCUMENTS_LIST: "Amadokhumenti nezixhumanisi zibuyiswe ngempumelelo.",
    DOCUMENTS_DETAILS: "Imininingwane yedokhumenti noma yesixhumanisi ibuyiswe ngempumelelo.",
    DOCUMENTS_NOT_FOUND: "Idatha yedokhumenti noma yesixhumanisi ayitholakali.",
    DOCUMENTS_UPDATED: "Idokhumenti noma Isixhumanisi sibuyekezwe ngempumelelo.",
    DOCUMENTS_DELETED: "Idokhumenti noma Isixhumanisi sisuswe ngempumelelo.",

    // --------------------------
    INSTITUTE_LOGO_REMOVED: "Ilogo yesikole isusiwe ngempumelelo",
    GENERAL_SETTING_UPDATED: "Izilungiselelo ezijwayelekile zibuyekeziwe ngempumelelo",
    PARENTS_LIMIT_FOR_ADMIN:
        "Umkhawulo wabafundi abavunyelwe kuleli sikole usufinyelelwe. Sicela ususe ulwazi lukazali noma ukhulise umkhawulo wabasebenzisi abavunyelwe kuleli sikole",
    LOGO_UPDATED: "Ilogo yesikole ibuyekeziwe ngempumelelo",
    ALL_NOTIFICATION_READ: "Zonke izaziso zikhonjwe njengokufundiwe.",
    USER_IS_ALREADY_VERIFIED: "Umsebenzisi usuqinisekisiwe",
    INVALID_EMAIL: "I-imeyili ayisebenzi",
    USER_VERIFIED: "I-imeyili yakho iqinisekisiwe ngempumelelo. Sicela usethe iphasiwedi yakho.",
    EMAIL_NOT_VERIFIED: "Ikheli lakho le-imeyili alikaqinisekiswa. Hlola ibhokisi lakho lokungenayo bese uqinisekisa i-imeyili yakho ukuze uqhubeke.",

    // ---------------------------
    TIME_TABLE_ALREADY_EXIST:
        "Isheduli leziHlwele lalolu hlobo lwesigaba nesifundo ngedethi nesikhathi esifanayo selivele likhona. Awukwazi ukudala elinye elinezincazelo ezifanayo.",
    TIME_TABLE_CREATED: "Isheduli leziHlwele lidalwe ngempumelelo.",
    TIME_TABLE_UPDATED: "Isheduli leziHlwele libuyekeziwe ngempumelelo.",
    TIME_TABLE_LIST: "Uhlu lwesheduli leziHlwele lutholiwe ngempumelelo.",
    TIME_TABLE_DETAIL: "Imininingwane yesheduli leziHlwele itholwe ngempumelelo.",
    TIME_TABLE_DELETED: "Isheduli leziHlwele lisuswe ngempumelelo.",

    // ---------------------------
    REQUEST_ADDED: "Isicelo sakho sokweseka sithunyelwe ngempumelelo. Ithimba lethu lizokubuya maduze. Siyabonga ngokusithinta!",
    SUPPORT_LIST: "Uhlu lokwesekwa lutholwe ngempumelelo",
    REQUEST_DETAIL: "Imininingwane yesicelo sokwesekwa itholwe ngempumelelo",
    REQUEST_DELETED: "Isicelo Sokwesekwa sicashe kahle",

    // ---------------------------
    SETUP_DATA_UPDATED: "Isinyathelo sokusetha sibuyekezwe ngempumelelo",
    SETUP_DATA_FETCHED: "Isimo sokumisa sibuyiselwe ngempumelelo",

    // --------------------------

    YOU_CANNOT_DELETE_THIS_CLASS: "Awukwazi ukususa le klasi njengoba izothinta ezinye izixhumanisi ezihlobene.",
    YOU_CANNOT_DELETE_THIS_GRADE: "Awukwazi ukususa leli banga njengoba izothinta ezinye izixhumanisi ezihlobene.",
    BATCH_DATA_NOT_FOUND: "Ibatch ayitholakalanga.",
    YOU_CANNOT_DELETE_THIS_SUBJECT:
        "Awukwazi ukususa lesi sifundo njengoba sixhumene namanye amarekhodi, futhi ukusisusa kungathinta abafundi nedatha ehlobene.",
    DATA_IMPORTED_SUCCESSFULLY: "Idatha yezifundo ezinkulu ifakwe ngempumelelo",

    UNREAD_NOTIFICATION: "Inani lezaziso ezingafundwanga",
};
