import { createTheme } from '@mui/material/styles';
import dialogActions from "./components/dialog/dialogActions.js";
import dialogContentText from "./components/dialog/dialogContentText.js";
import dialogContent from "./components/dialog/dialogContent.js";
import dialogTitle from "./components/dialog/dialogTitle.js";
import dialog from "./components/dialog/index.js";
import link from "./components/link.js";
import svgIcon from "./components/svgIcon.js";
import icon from "./components/icon.js";
import buttonBase from "./components/buttonBase.js";
import popover from "./components/popover.js";
import input from "./components/form/input.js";
import autocomplete from "./components/form/autocomplete.js";
import radio from "./components/form/radio.js";
import checkbox from "./components/form/checkbox.js";
import formLabel from "./components/form/formLabel.js";
import formControlLabel from "./components/form/formControlLabel.js";
import select from "./components/form/select.js";
import stepIcon from "./components/stepper/stepIcon.js";
import stepLabel from "./components/stepper/stepLabel.js";
import stepConnector from "./components/stepper/stepConnector.js";
import step from "./components/stepper/step.js";
import stepper from "./components/stepper/index.js";
import tab from "./components/tabs/tab.js";
import tabs from "./components/tabs/index.js";
import appBar from "./components/appBar.js";
import tooltip from "./components/tooltip.js";
import avatar from "./components/avatar.js";
import slider from "./components/slider.js";
import breadcrumbs from "./components/breadcrumbs.js";
import linearProgress from "./components/linearProgress.js";
import tableCell from "./components/table/tableCell.js";
import tableHead from "./components/table/tableHead.js";
import tableContainer from "./components/table/tableContainer.js";
import divider from "./components/divider.js";
import switchButton from "./components/form/switchButton.js";
import menuItem from "./components/menu/menuItem.js";
import menu from "./components/menu/index.js";
import inputBase from "./components/form/inputBase.js";
import iconButton from "./components/iconButton.js";
import button from "./components/button/index.js";
import cardContent from "./components/card/cardContent.js";
import cardMedia from "./components/card/cardMedia.js";
import card from "./components/card/index.js";
import listItemText from "./components/list/listItemText.js";
import listItem from "./components/list/listItem.js";
import list from "./components/list/index.js";
import sidenav from "./components/sidenav.js";
import container from "./components/container.js";
import globals from "./base/globals.js";
import rgba from "./functions/rgba.js";
import pxToRem from "./functions/pxToRem.js";
import linearGradient from "./functions/linearGradient.js";
import boxShadow from "./functions/boxShadow.js";
import hexToRgb from "./functions/hexToRgb.js";
import borders from "./base/borders.js";
import boxShadows from "./base/boxShadows.js";
import typography from "./base/typography.js";
import breakpoints from "./base/breakpoints.js";
import colors from "./base/colors.js";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    ...colors,
    background: {
      default: "#0f0f23",
      paper: "#1a1a2e",
    },
    text: {
      primary: "#e0e0e0",
      secondary: "#b0b0b0",
    },
  },
  breakpoints: { ...breakpoints },
  typography: { ...typography },
  boxShadows: { ...boxShadows },
  borders: { ...borders },
  functions: {
    boxShadow,
    hexToRgb,
    linearGradient,
    pxToRem,
    rgba,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ...globals,
        ...container,
      },
    },
    MuiDrawer: { ...sidenav },
    MuiList: { ...list },
    MuiListItem: { ...listItem },
    MuiListItemText: { ...listItemText },
    MuiCard: { ...card },
    MuiCardMedia: { ...cardMedia },
    MuiCardContent: { ...cardContent },
    MuiButton: { ...button },
    MuiIconButton: { ...iconButton },
    MuiInputBase: { ...inputBase },
    MuiMenu: { ...menu },
    MuiMenuItem: { ...menuItem },
    MuiSwitch: { ...switchButton },
    MuiDivider: { ...divider },
    MuiTableContainer: { ...tableContainer },
    MuiTableHead: { ...tableHead },
    MuiTableCell: { ...tableCell },
    MuiLinearProgress: { ...linearProgress },
    MuiBreadcrumbs: { ...breadcrumbs },
    MuiSlider: { ...slider },
    MuiAvatar: { ...avatar },
    MuiTooltip: { ...tooltip },
    MuiAppBar: { ...appBar },
    MuiTabs: { ...tabs },
    MuiTab: { ...tab },
    MuiStepper: { ...stepper },
    MuiStep: { ...step },
    MuiStepConnector: { ...stepConnector },
    MuiStepLabel: { ...stepLabel },
    MuiStepIcon: { ...stepIcon },
    MuiSelect: { ...select },
    MuiFormControlLabel: { ...formControlLabel },
    MuiFormLabel: { ...formLabel },
    MuiCheckbox: { ...checkbox },
    MuiRadio: { ...radio },
    MuiAutocomplete: { ...autocomplete },
    MuiInput: { ...input },
    MuiOutlinedInput: { ...input },
    MuiFilledInput: { ...input },
    MuiPopover: { ...popover },
    MuiButtonBase: { ...buttonBase },
    MuiIcon: { ...icon },
    MuiSvgIcon: { ...svgIcon },
    MuiLink: { ...link },
    MuiDialog: { ...dialog },
    MuiDialogTitle: { ...dialogTitle },
    MuiDialogContent: { ...dialogContent },
    MuiDialogContentText: { ...dialogContentText },
    MuiDialogActions: { ...dialogActions },
  },
});

export default lightTheme;
