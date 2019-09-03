import * as projectIntro from "project-intro";
import "jquery-ui/ui/widgets/datepicker";
import "jquery-ui/ui/widgets/slider";

import "./assets/style/jquery-ui.css";
import "./assets/style/timepicker.css";
import "./assets/style/fullcalendar.min.css";
import "./assets/style/normalize.css";
import "./assets/style/main.css";
import "./assets/style/headerBar.css";
import "./assets/style/iconsView.css";
import "./assets/style/listView.css";
import "./assets/style/columnsView.css";
import "./assets/style/menus.css";

import "./app/timepicker.js";
import "./app/fullcalendar.min.js";
import "./app/global.js";
import "./app/cookies.js";
import "./app/navigation.js";
import "./app/printers.js";
import "./app/basicFilter.js";
import "./app/advancedFilter.js";
import "./app/config.js";

window.projectIntro = projectIntro;
projectIntro.init();