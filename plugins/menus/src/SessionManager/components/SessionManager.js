import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import IconButton from '@material-ui/core/IconButton'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import Paper from '@material-ui/core/Paper'
import DeleteIcon from '@material-ui/icons/Delete'
import ViewListIcon from '@material-ui/icons/ViewList'
import { makeStyles } from '@material-ui/core/styles'
import { observer } from 'mobx-react'
import React, { useState } from 'react'

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(1),
  },
}))

export default observer(({ session }) => {
  const classes = useStyles()
  const [sessionUuidToDelete, setSessionUuidToDelete] = useState('')
  const [open, setOpen] = useState(false)

  function handleDialogOpen(key) {
    setSessionUuidToDelete(key)
    setOpen(true)
  }

  function handleDialogClose(deleteSession = false) {
    if (deleteSession) localStorage.removeItem(sessionUuidToDelete)
    setSessionUuidToDelete(null)
    setOpen(false)
  }

  const sessionNameToDelete =
    JSON.parse(localStorage.getItem(sessionUuidToDelete))?.name || ''

  return (
    <>
      <Paper className={classes.root}>
        <List
          subheader={<ListSubheader>Choose a session to open</ListSubheader>}
        >
          {Object.entries(localStorage)
            .filter(obj => obj[0].startsWith('local-'))
            .map(localStorageSession => {
              const [key, value] = localStorageSession
              let sessionSnapshot
              try {
                sessionSnapshot = JSON.parse(value)
              } catch (e) {
                return undefined
              }

              const { views = [] } = sessionSnapshot
              const openTrackCount = views.map(
                view => (view.tracks || []).length,
              )
              let viewDetails
              switch (views.length) {
                case 0: {
                  viewDetails = '0 views'
                  break
                }
                case 1: {
                  viewDetails = `1 view, ${openTrackCount[0]} open track${
                    openTrackCount[0] === 1 ? '' : 's'
                  }`
                  break
                }
                case 2: {
                  viewDetails = `2 views; ${openTrackCount[0]} and ${openTrackCount[1]} open tracks`
                  break
                }
                default: {
                  viewDetails = `${views.length} views; ${openTrackCount
                    .slice(0, views.length - 1)
                    .join(', ')}, and ${
                    openTrackCount[views.length - 1]
                  } open tracks`
                  break
                }
              }
              return (
                <ListItem
                  button
                  disabled={session.name === sessionSnapshot.name}
                  onClick={() =>
                    session.activateLocalSession(key, sessionSnapshot.name)
                  }
                  key={key}
                >
                  <ListItemIcon>
                    <ViewListIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={sessionSnapshot.name}
                    secondary={
                      session.name === sessionSnapshot.name
                        ? 'Currently open'
                        : viewDetails
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      disabled={session.name === sessionSnapshot.name}
                      aria-label="Delete"
                      onClick={() => handleDialogOpen(key)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              )
            })}
        </List>
      </Paper>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {`Delete session "${sessionNameToDelete}"?`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action cannot be undone{`\n(id: ${sessionUuidToDelete})`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialogClose()} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => handleDialogClose(true)}
            color="primary"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
})
