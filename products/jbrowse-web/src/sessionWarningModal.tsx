import React, { useState } from 'react'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Divider from '@material-ui/core/Divider'
import WarningIcon from '@material-ui/icons/Warning'
import shortid from 'shortid'
import { Instance, IAnyStateTreeNode } from 'mobx-state-tree'
import { SessionLoader } from './Loader'

const useStyles = makeStyles(theme => ({
  main: {
    textAlign: 'center',
    margin: theme.spacing(2),
    padding: theme.spacing(2),
    borderWidth: 2,
    borderRadius: 2,
  },
  buttons: {
    margin: theme.spacing(2),
    color: theme.palette.text.primary,
  },
}))

export default function SessionWarningModal({
  loader,
  sessionTriaged,
}: {
  loader: Instance<SessionLoader>
  sessionTriaged: { snap: IAnyStateTreeNode; origin: string }
}) {
  const classes = useStyles()
  const [open, setOpen] = useState(true)

  const session = JSON.parse(JSON.stringify(sessionTriaged.snap))

  const handleClose = () => {
    loader.setShareWarningOpen(false)
    setOpen(false)
  }
  return (
    <>
      <Dialog
        maxWidth="xl"
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        data-testid="session-warning-modal"
        className={classes.main}
      >
        <DialogTitle id="alert-dialog-title">Warning</DialogTitle>
        <Divider />
        <div>
          <WarningIcon fontSize="large" />
          <DialogContent>
            <DialogContentText>
              About to load a session from an external source
            </DialogContentText>
            <DialogContentText>
              Please confirm that you trust the loaded file contents.
            </DialogContentText>
          </DialogContent>
          <div className={classes.buttons}>
            <Button
              color="primary"
              variant="contained"
              style={{ marginRight: 5 }}
              onClick={() => {
                sessionTriaged.origin === 'share'
                  ? loader.setSessionSnapshot({
                      ...session,
                      id: shortid(),
                    })
                  : loader.setConfigSnapshot({
                      ...session,
                      id: shortid(),
                    })
                handleClose()
              }}
            >
              Confirm
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                loader.setBlankSession(true)
                handleClose()
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}
