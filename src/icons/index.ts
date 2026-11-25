import ArrowUp from './arrow-up.vue'
import ArrowDown from './arrow-down.vue'
import ArrowLeft from './arrow-left.vue'
import ArrowRight from './arrow-right.vue'
import Clear from './clear.vue'
import MoreVertical from './more-vertical.vue'
import type { UiIconCatalogue } from '@uninterface/uninterface/icons'
import Icon0 from './add.vue'
import Icon1 from './edit.vue'
import Icon2 from './delete.vue'
import Icon3 from './save.vue'
import Icon4 from './cancel.vue'
import Icon5 from './confirm.vue'
import Icon6 from './search.vue'
import Icon7 from './refresh.vue'
import Icon8 from './copy.vue'
import Icon9 from './upload.vue'
import Icon10 from './download.vue'
import Icon11 from './close.vue'
import Icon12 from './menu.vue'
import Icon13 from './more.vue'
import Icon14 from './previous.vue'
import Icon15 from './next.vue'
import Icon16 from './expand.vue'
import Icon17 from './collapse.vue'
import Icon18 from './info.vue'
import Icon19 from './success.vue'
import Icon20 from './warning.vue'
import Icon21 from './error.vue'
import Icon22 from './show.vue'
import Icon23 from './hide.vue'
import CommonRemove from './remove.vue'
import CommonReset from './reset.vue'
import CommonRetry from './retry.vue'
import CommonHome from './home.vue'
import CommonHelp from './help.vue'
import CommonBookmark from './bookmark.vue'
import CommonLocation from './location.vue'
import CommonGlobe from './globe.vue'
import CommonCalendar from './calendar.vue'
import CommonTime from './time.vue'
import CommonFile from './file.vue'
import CommonImage from './image.vue'
import CommonAttachment from './attachment.vue'
import CommonEmail from './email.vue'
import CommonFilter from './filter.vue'
import CommonSort from './sort.vue'
import CommonSortAscending from './sort-ascending.vue'
import CommonSortDescending from './sort-descending.vue'
import CommonFirst from './first.vue'
import CommonLast from './last.vue'
import CommonExternalLink from './external-link.vue'
import CommonLink from './link.vue'
import CommonSettings from './settings.vue'
export default {
  'arrow-up': { component: ArrowUp },
  'arrow-down': { component: ArrowDown },
  'arrow-left': { component: ArrowLeft },
  'arrow-right': { component: ArrowRight },

  'menu-item': { component: CommonFile },
  add: { component: Icon0 },
  edit: { component: Icon1 },
  delete: { component: Icon2 },
  save: { component: Icon3 },
  cancel: { component: Icon4 },
  confirm: { component: Icon5 },
  search: { component: Icon6 },
  refresh: { component: Icon7 },
  copy: { component: Icon8 },
  upload: { component: Icon9 },
  download: { component: Icon10 },
  close: { component: Icon11 },
  menu: { component: Icon12 },
  more: { component: Icon13 },
  'more-horizontal': { component: Icon13 },
  'more-vertical': { component: MoreVertical },
  previous: { component: Icon14, mirrorInRtl: true },
  next: { component: Icon15, mirrorInRtl: true },
  expand: { component: Icon16 },
  collapse: { component: Icon17 },
  'move-up': { component: ArrowUp },
  'move-down': { component: ArrowDown },
  info: { component: Icon18 },
  success: { component: Icon19 },
  warning: { component: Icon20 },
  error: { component: Icon21 },
  show: { component: Icon22 },
  hide: { component: Icon23 },
  create: { component: Icon0 },
  remove: { component: CommonRemove },
  reset: { component: CommonReset },
  clear: { component: Clear },
  retry: { component: CommonRetry },
  home: { component: CommonHome },
  help: { component: CommonHelp },
  bookmark: { component: CommonBookmark },
  location: { component: CommonLocation },
  globe: { component: CommonGlobe },
  calendar: { component: CommonCalendar },
  time: { component: CommonTime },
  file: { component: CommonFile },
  image: { component: CommonImage },
  attachment: { component: CommonAttachment },
  email: { component: CommonEmail },
  filter: { component: CommonFilter },
  sort: { component: CommonSort },
  'sort-ascending': { component: CommonSortAscending },
  'sort-descending': { component: CommonSortDescending },
  first: { component: CommonFirst, mirrorInRtl: true },
  last: { component: CommonLast, mirrorInRtl: true },
  link: { component: CommonLink },
  'external-link': { component: CommonExternalLink },
  settings: { component: CommonSettings },
} satisfies UiIconCatalogue
