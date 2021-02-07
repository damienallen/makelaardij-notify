import { createMuiTheme } from '@material-ui/core/styles'

export const lightTheme = createMuiTheme({
    palette: {
        primary: {
            light: '#efefef',
            main: '#bdbdbd',
            dark: '#8d8d8d',
            contrastText: '#000',
        },
        secondary: {
            light: '#fffd61',
            main: '#ffca28',
            dark: '#c79a00',
            contrastText: '#000',
        },
        type: 'light',
    },
})

export const darkTheme = createMuiTheme({
    palette: {
        primary: {
            light: '#8e8e8e',
            main: '#616161',
            dark: '#373737',
            contrastText: '#fff',
        },
        secondary: {
            light: '#fffd61',
            main: '#ffca28',
            dark: '#c79a00',
            contrastText: '#000',
        },
        type: 'dark',
    },
})
