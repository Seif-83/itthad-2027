/**
 * اتحاد طلاب كلية الحاسبات وعلوم البيانات 2027
 * البيانات الأولية والتكوين الأساسي
 * رئيس الاتحاد: سيف عمرو
 * نائب رئيس الاتحاد: علي تيتو
 */

const DEFAULT_COMMITTEES = [
    {
        id: "scientific",
        name: "اللجنة العلمية",
        icon: "fa-solid fa-microchip",
        color: "#00d2ff",
        colorGradient: "linear-gradient(135deg, #00d2ff 0%, #0066ff 100%)",
        description: "تنظيم الورش التقنية، البرمجة، مسابقات الذكاء الاصطناعي والهاكاثونات العلمية.",
        maxMembers: 6
    },
    {
        id: "cultural",
        name: "اللجنة الثقافية",
        icon: "fa-solid fa-book-open-reader",
        color: "#f59e0b",
        colorGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        description: "المناظرات، الندوات الفكرية، مجلة الكلية، والمسابقات الأدبية والشعرية.",
        maxMembers: 6
    },
    {
        id: "social",
        name: "اللجنة الاجتماعية",
        icon: "fa-solid fa-hand-holding-heart",
        color: "#10b981",
        colorGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        description: "الرحلات الطلابية، معارض الخير، تكريم أوائل الفرق، وخدمة المجتمع.",
        maxMembers: 6
    },
    {
        id: "families",
        name: "لجنة الأسر",
        icon: "fa-solid fa-people-roof",
        color: "#f43f5e",
        colorGradient: "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)",
        description: "الإشراف على الأسر الطلابية، مهرجان الأسر السنوي، والأنشطة التنافسية المجمعة.",
        maxMembers: 6
    },
    {
        id: "sports",
        name: "اللجنة الرياضية",
        icon: "fa-solid fa-trophy",
        color: "#8b5cf6",
        colorGradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
        description: "دوريات كرة القدم والكرة الطائرة، بطولة الألعاب الإلكترونية (E-Sports)، والشطرنج.",
        maxMembers: 6
    },
    {
        id: "volunteers",
        name: "لجنة الفولنتيرز",
        icon: "fa-solid fa-users-gear",
        color: "#f97316",
        colorGradient: "linear-gradient(135deg, #f97316 0%, #c2410c 100%)",
        description: "إدارة وتنظيم فعاليات ومؤتمرات الكلية، الاستقبال، والتنسيق اللوجستي الميداني.",
        maxMembers: 6
    },
    {
        id: "media",
        name: "لجنة الميديا",
        icon: "fa-solid fa-photo-film",
        color: "#ec4899",
        colorGradient: "linear-gradient(135deg, #ec4899 0%, #a855f7 100%)",
        description: "التصوير الاحترافي، المونتاج، الجرافيك ديزاين، وإدارة المنصات الرقمية للاتحاد.",
        maxMembers: 6
    }
];

const INITIAL_MEMBERS = [];

const UNION_LEADERS = {
    president: {
        name: "سيف عمرو",
        title: "رئيس اتحاد طلاب كلية الحاسبات وعلوم البيانات",
        term: "2027",
        phone: "01000000001",
        email: "seif.amr@cds.edu.eg",
        avatarText: "س"
    },
    vicePresident: {
        name: "علي تيتو",
        title: "نائب رئيس اتحاد طلاب كلية الحاسبات وعلوم البيانات",
        term: "2027",
        phone: "01000000002",
        email: "ali.tito@cds.edu.eg",
        avatarText: "ع"
    }
};
