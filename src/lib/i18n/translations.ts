export type SupportedLanguage = "en" | "th";

export interface TranslationDictionary {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    confirm: string;
    back: string;
    close: string;
    search: string;
    filter: string;
    loading: string;
    actions: string;
    status: string;
    priority: string;
    dueDate: string;
    startDate: string;
    assignees: string;
    title: string;
    description: string;
    optional: string;
    required: string;
    viewAll: string;
    done: string;
    inProgress: string;
    toDo: string;
    review: string;
  };
  nav: {
    workspaces: string;
    workspace: string;
    board: string;
    calendar: string;
    diary: string;
    notes: string;
    members: string;
    rewards: string;
    settings: string;
    help: string;
    contact: string;
    profile: string;
    logout: string;
    commandPalette: string;
    focusMode: string;
  };
  topbar: {
    askAi: string;
    notifications: string;
    userMenu: string;
    systemGuide: string;
    language: string;
    theme: string;
    lightMode: string;
    darkMode: string;
    systemMode: string;
  };
  kanban: {
    boardTitle: string;
    tableTitle: string;
    addColumn: string;
    addCard: string;
    normalDensity: string;
    compactDensity: string;
    exportBoard: string;
    wipLimit: string;
    dragHandle: string;
    cardCompleted: string;
    sendCheers: string;
    filterTasks: string;
    priorities: string;
    attributes: string;
    templatePicker: string;
  };
  table: {
    rowNumber: string;
    taskTitle: string;
    statusColumn: string;
    priorityColumn: string;
    assigneesColumn: string;
    dueDateColumn: string;
    hoverCheckboxTip: string;
    sortByPriority: string;
    flatView: string;
    groupedView: string;
  };
  ai: {
    assistantName: string;
    assistantTag: string;
    zeroConfig: string;
    autoBreakdown: string;
    executiveSummary: string;
    askPromptPlaceholder: string;
    quickPrompts: string;
    summarizeSprint: string;
    breakdownTask: string;
    detectBottlenecks: string;
    creatingCardsDraft: string;
    confirmCreate: string;
  };
  calendar: {
    dayOverview: string;
    monthView: string;
    weekView: string;
    todayPreset: string;
    tomorrowPreset: string;
    weekendPreset: string;
    nextWeekPreset: string;
    selectTime: string;
    allDay: string;
    confirmTime: string;
  };
  gamification: {
    cheersCup: string;
    coinsBalance: string;
    cheersSent: string;
    rewardsStore: string;
    redeemItem: string;
    cheersFeedback: string;
  };
  help: {
    title: string;
    subtitle: string;
    docsTab: string;
    interactiveTab: string;
    shortcutsTab: string;
    faqTab: string;
    searchPlaceholder: string;
    allCategories: string;
    gettingStarted: string;
    architecture: string;
    keyCapabilities: string;
    workflowGuide: string;
    technicalSpecs: string;
    proTips: string;
    keyboardShortcut: string;
    copyShortcut: string;
    copied: string;
    wasHelpful: string;
    feedbackThanks: string;
    prevArticle: string;
    nextArticle: string;
    onThisPage: string;
    needMoreHelp: string;
    askAiCta: string;
  };
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      create: "Create",
      confirm: "Confirm",
      back: "Back",
      close: "Close",
      search: "Search",
      filter: "Filter",
      loading: "Loading...",
      actions: "Actions",
      status: "Status",
      priority: "Priority",
      dueDate: "Due Date",
      startDate: "Start Date",
      assignees: "Assignees",
      title: "Title",
      description: "Description",
      optional: "Optional",
      required: "Required",
      viewAll: "View All",
      done: "Done",
      inProgress: "In Progress",
      toDo: "To Do",
      review: "Review",
    },
    nav: {
      workspaces: "Workspaces",
      workspace: "Workspace",
      board: "Board",
      calendar: "Calendar",
      diary: "Diary",
      notes: "Notes",
      members: "Members",
      rewards: "Rewards Store",
      settings: "Settings",
      help: "Help & System Guide",
      contact: "Contact Us",
      profile: "Profile Settings",
      logout: "Log out",
      commandPalette: "Command Palette",
      focusMode: "Focus Mode",
    },
    topbar: {
      askAi: "Ask AI",
      notifications: "Notifications",
      userMenu: "User Menu",
      systemGuide: "System Guide",
      language: "Language",
      theme: "Theme",
      lightMode: "Light",
      darkMode: "Dark",
      systemMode: "System",
    },
    kanban: {
      boardTitle: "Kanban Board",
      tableTitle: "Spreadsheet Table",
      addColumn: "Add Column",
      addCard: "Add Card",
      normalDensity: "Normal Density",
      compactDensity: "Compact 2x Density",
      exportBoard: "Export",
      wipLimit: "WIP Limit",
      dragHandle: "Drag to reorder",
      cardCompleted: "Card completed!",
      sendCheers: "Send Cheers",
      filterTasks: "Filter tasks...",
      priorities: "Priorities",
      attributes: "Attributes",
      templatePicker: "Template Picker",
    },
    table: {
      rowNumber: "#",
      taskTitle: "Task Title",
      statusColumn: "Status",
      priorityColumn: "Priority",
      assigneesColumn: "Assignees",
      dueDateColumn: "Due Date",
      hoverCheckboxTip: "Hover row number to mark as done",
      sortByPriority: "Sort by Priority",
      flatView: "Flat Table",
      groupedView: "Grouped by Column",
    },
    ai: {
      assistantName: "Retzlo AI",
      assistantTag: "Built-in Intelligence",
      zeroConfig: "100% Server Managed (Zero-Config)",
      autoBreakdown: "AI Task Breakdown",
      executiveSummary: "AI Executive Summary",
      askPromptPlaceholder: "Ask Retzlo AI about your project...",
      quickPrompts: "Quick Starter Prompts",
      summarizeSprint: "Summarize this sprint's status",
      breakdownTask: "Break down into 5 actionable checklist items",
      detectBottlenecks: "Identify blocked tasks and bottlenecks",
      creatingCardsDraft: "Drafting tasks for confirmation...",
      confirmCreate: "Confirm Card Creation",
    },
    calendar: {
      dayOverview: "Day Overview",
      monthView: "Month",
      weekView: "Week",
      todayPreset: "Today",
      tomorrowPreset: "Tomorrow",
      weekendPreset: "This Weekend",
      nextWeekPreset: "Next Week",
      selectTime: "Select Time",
      allDay: "All Day",
      confirmTime: "Done",
    },
    gamification: {
      cheersCup: "Coffee Cheers",
      coinsBalance: "Coins Balance",
      cheersSent: "Cheers sent!",
      rewardsStore: "Project Rewards Store",
      redeemItem: "Redeem Reward",
      cheersFeedback: "You cheered your teammate (+5 Coins)!",
    },
    help: {
      title: "System Guide & Documentation",
      subtitle: "Learn the modular architecture, professional workflows, and native AI capabilities.",
      docsTab: "Documentation",
      interactiveTab: "Live Playground",
      shortcutsTab: "Shortcuts Matrix",
      faqTab: "FAQ & Help",
      searchPlaceholder: "Search topics, AI, Spreadsheet, 10 Priorities, shortcuts...",
      allCategories: "All Topics",
      gettingStarted: "Getting Started",
      architecture: "Architecture Overview",
      keyCapabilities: "Key Capabilities",
      workflowGuide: "Step-by-Step Workflow Guide",
      technicalSpecs: "Technical Specifications",
      proTips: "Pro Tips",
      keyboardShortcut: "Keyboard Shortcut",
      copyShortcut: "Copy Shortcut",
      copied: "Copied!",
      wasHelpful: "Was this article helpful?",
      feedbackThanks: "Thank you for your feedback!",
      prevArticle: "Previous Article",
      nextArticle: "Next Article",
      onThisPage: "On this page",
      needMoreHelp: "Need further assistance?",
      askAiCta: "Ask Retzlo AI",
    },
  },
  th: {
    common: {
      save: "บันทึก",
      cancel: "ยกเลิก",
      delete: "ลบ",
      edit: "แก้ไข",
      create: "สร้าง",
      confirm: "ยืนยัน",
      back: "ย้อนกลับ",
      close: "ปิด",
      search: "ค้นหา",
      filter: "กรอง",
      loading: "กำลังโหลด...",
      actions: "การจัดการ",
      status: "สถานะ",
      priority: "ความสำคัญ",
      dueDate: "กำหนดส่ง",
      startDate: "วันเริ่มต้น",
      assignees: "ผู้รับผิดชอบ",
      title: "หัวข้อ",
      description: "รายละเอียด",
      optional: "ไม่บังคับ",
      required: "จำเป็น",
      viewAll: "ดูทั้งหมด",
      done: "เสร็จสิ้น",
      inProgress: "กำลังดำเนินการ",
      toDo: "รอดำเนินการ",
      review: "รอตรวจสอบ",
    },
    nav: {
      workspaces: "พื้นที่ทำงานทั้งหมด",
      workspace: "พื้นที่ทำงาน",
      board: "บอร์ดงาน",
      calendar: "ปฏิทิน",
      diary: "ไดอารี่",
      notes: "สมุดโน้ต",
      members: "สมาชิกในทีม",
      rewards: "ร้านค้าของรางวัล",
      settings: "ตั้งค่าโปรเจกต์",
      help: "คู่มือ & ข้อมูลระบบ",
      contact: "ติดต่อเรา",
      profile: "ตั้งค่าโปรไฟล์",
      logout: "ออกจากระบบ",
      commandPalette: "ค้นหาด่วน (Command Palette)",
      focusMode: "โหมดโฟกัส",
    },
    topbar: {
      askAi: "ถาม AI",
      notifications: "การแจ้งเตือน",
      userMenu: "เมนูผู้ใช้",
      systemGuide: "คู่มือระบบ",
      language: "ภาษา",
      theme: "ธีม",
      lightMode: "สว่าง (Warm Light)",
      darkMode: "มืด (Retro Lofi)",
      systemMode: "ตามระบบ",
    },
    kanban: {
      boardTitle: "บอร์ด Kanban",
      tableTitle: "ตาราง Spreadsheet",
      addColumn: "เพิ่มคอลัมน์",
      addCard: "เพิ่มการ์ดงาน",
      normalDensity: "ความหนาแน่นปกติ",
      compactDensity: "ความหนาแน่น Compact 2x",
      exportBoard: "ส่งออกข้อมูล",
      wipLimit: "จำกัดงาน (WIP Limit)",
      dragHandle: "จับลากเพื่อสลับลำดับ",
      cardCompleted: "งานเสร็จสิ้นแล้ว!",
      sendCheers: "ส่งกำลังใจ Cheers",
      filterTasks: "กรองรายการงาน...",
      priorities: "ระดับความสำคัญ",
      attributes: "คุณสมบัติการ์ด",
      templatePicker: "เลือกแม่แบบบอร์ด",
    },
    table: {
      rowNumber: "#",
      taskTitle: "ชื่องาน",
      statusColumn: "สถานะ",
      priorityColumn: "ความสำคัญ",
      assigneesColumn: "ผู้รับผิดชอบ",
      dueDateColumn: "กำหนดส่ง",
      hoverCheckboxTip: "ชี้ที่เลขแถวเพื่อติ๊กงานเสร็จทันที",
      sortByPriority: "เรียงตามความสำคัญ",
      flatView: "ตารางเรียบ",
      groupedView: "จัดกลุ่มตามคอลัมน์",
    },
    ai: {
      assistantName: "Retzlo AI",
      assistantTag: "ระบบ AI อัจฉริยะในตัว",
      zeroConfig: "ระบบประมวลผลเซิร์ฟเวอร์ในตัว (Zero-Config)",
      autoBreakdown: "AI แตกการ์ดย่อยอัตโนมัติ",
      executiveSummary: "AI สรุปสุขภาพโครงการ",
      askPromptPlaceholder: "พิมพ์ถาม Retzlo AI เกี่ยวกับโปรเจกต์...",
      quickPrompts: "คำสั่งสำเร็จรูปด่วน",
      summarizeSprint: "สรุปภาพรวมความคืบหน้าของสปรินต์",
      breakdownTask: "ช่วยแตกงานเป็นเช็คลิสต์ 5 ข้อย่อย",
      detectBottlenecks: "ตรวจสอบงานคั่งค้างและคอขวดของทีม",
      creatingCardsDraft: "กำลังร่างการ์ดงานเพื่อรอการยืนยัน...",
      confirmCreate: "ยืนยันการสร้างการ์ดลงบอร์ด",
    },
    calendar: {
      dayOverview: "ภาพรวมรายวัน",
      monthView: "เดือน",
      weekView: "สัปดาห์",
      todayPreset: "วันนี้",
      tomorrowPreset: "พรุ่งนี้",
      weekendPreset: "สุดสัปดาห์นี้",
      nextWeekPreset: "สัปดาห์หน้า",
      selectTime: "เลือกเวลา",
      allDay: "ตลอดวัน",
      confirmTime: "ตกลง",
    },
    gamification: {
      cheersCup: "ส่งแก้วกาแฟ Cheers",
      coinsBalance: "เหรียญสะสม",
      cheersSent: "ส่งกำลังใจเรียบร้อยแล้ว!",
      rewardsStore: "ร้านค้าของรางวัลประจำโปรเจกต์",
      redeemItem: "แลกของรางวัล",
      cheersFeedback: "คุณส่งกำลังใจให้เพื่อนร่วมทีม (+5 Coins)!",
    },
    help: {
      title: "ข้อมูลระบบ & คู่มือการใช้งาน",
      subtitle: "ทำความเข้าใจสถาปัตยกรรมโมดูลาร์ เวิร์กโฟลว์ระดับมืออาชีพ และการใช้งาน AI ในตัว",
      docsTab: "คู่มือ",
      interactiveTab: "จำลองสด",
      shortcutsTab: "คีย์ลัด",
      faqTab: "FAQ",
      searchPlaceholder: "ค้นหา เช่น AI, Spreadsheet, 10 Priorities, คีย์ลัด...",
      allCategories: "ทุกหมวดหมู่",
      gettingStarted: "ภาพรวมระบบ",
      architecture: "สถาปัตยกรรมระบบ",
      keyCapabilities: "คุณสมบัติหลัก",
      workflowGuide: "ขั้นตอนการใช้งานจริง",
      technicalSpecs: "ข้อมูลจำเพาะทางเทคนิค",
      proTips: "เคล็ดลับจากผู้เชี่ยวชาญ",
      keyboardShortcut: "คีย์ลัดด่วน",
      copyShortcut: "คัดลอกคีย์ลัด",
      copied: "คัดลอกแล้ว!",
      wasHelpful: "บทความนี้มีประโยชน์กับคุณหรือไม่?",
      feedbackThanks: "ขอบคุณสำหรับข้อเสนอแนะ!",
      prevArticle: "บทความก่อนหน้า",
      nextArticle: "บทความถัดไป",
      onThisPage: "ในบทความนี้",
      needMoreHelp: "ต้องการความช่วยเหลือเพิ่มเติม?",
      askAiCta: "ถาม Retzlo AI",
    },
  },
};
