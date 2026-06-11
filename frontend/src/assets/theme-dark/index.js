import { createTheme } from '@mui/material/styles';
import dialogActions from "../theme/components/dialog/dialogActions.js";
import dialogContentText from "../theme/components/dialog/dialogContentText.js";
import dialogContent from "../theme/components/dialog/dialogContent.js";
import dialogTitle from "../theme/components/dialog/dialogTitle.js";
import dialog from "../theme/components/dialog/index.js";
import link from "../theme/components/link.js";
import svgIcon from "../theme/components/svgIcon.js";
import icon from "../theme/components/icon.js";
import buttonBase from "../theme/components/buttonBase.js";
import popover from "../theme/components/popover.js";
import input from "../theme/components/form/input.js";
import autocomplete from "../theme/components/form/autocomplete.js";
import radio from "../theme/components/form/radio.js";
import checkbox from "../theme/components/form/checkbox.js";
import formLabel from "../theme/components/form/formLabel.js";
import formControlLabel from "../theme/components/form/formControlLabel.js";
import select from "../theme/components/form/select.js";
import stepIcon from "../theme/components/stepper/stepIcon.js";
import stepLabel from "../theme/components/stepper/stepLabel.js";
import stepConnector from "../theme/components/stepper/stepConnector.js";
import step from "../theme/components/stepper/step.js";
import stepper from "../theme/components/stepper/index.js";
import tab from "../theme/components/tabs/tab.js";
import tabs from "../theme/components/tabs/index.js";
import appBar from "../theme/components/appBar.js";
import tooltip from "../theme/components/tooltip.js";
import avatar from "../theme/components/avatar.js";
import slider from "../theme/components/slider.js";
import breadcrumbs from "../theme/components/breadcrumbs.js";
import linearProgress from "../theme/components/linearProgress.js";
import tableCell from "../theme/components/table/tableCell.js";
import tableHead from "../theme/components/table/tableHead.js";
import tableContainer from "../theme/components/table/tableContainer.js";
import divider from "../theme/components/divider.js";
import switchButton from "../theme/components/form/switchButton.js";
import menuItem from "../theme/components/menu/menuItem.js";
import menu from "../theme/components/menu/index.js";
import inputBase from "../theme/components/form/inputBase.js";
import iconButton from "../theme/components/iconButton.js";
import button from "../theme/components/button/index.js";
import cardContent from "../theme/components/card/cardContent.js";
import cardMedia from "../theme/components/card/cardMedia.js";
import card from "../theme/components/card/index.js";
import listItemText from "../theme/components/list/listItemText.js";
import listItem from "../theme/components/list/listItem.js";
import list from "../theme/components/list/index.js";
import sidenav from "../theme/components/sidenav.js";
import container from "../theme/components/container.js";
import globals from "../theme/base/globals.js";
import rgba from "../theme/functions/rgba.js";
import pxToRem from "../theme/functions/pxToRem.js";
import linearGradient from "../theme/functions/linearGradient.js";
import boxShadow from "../theme/functions/boxShadow.js";
import hexToRgb from "../theme/functions/hexToRgb.js";
import borders from "../theme/base/borders.js";
import boxShadows from "../theme/base/boxShadows.js";
import typography from "../theme/base/typography.js";
import breakpoints from "../theme/base/breakpoints.js";
import colors from "../theme/base/colors.js";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
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

export default darkTheme;
