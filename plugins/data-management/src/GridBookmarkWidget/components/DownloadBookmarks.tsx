import React, { useState } from 'react'
import { observer } from 'mobx-react'
import { saveAs } from 'file-saver'

import {
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  Select,
  MenuItem,
  makeStyles,
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import GetAppIcon from '@material-ui/icons/GetApp'

import { getSession } from '@jbrowse/core/util'
import { Region } from '@jbrowse/core/util/types'

import { GridBookmarkModel } from '../model'

function downloadBookmarkFile(bookmarkedRegions: Region[], fileFormat: string) {
  const fileHeader =
    fileFormat === 'TSV'
      ? 'chrom\tstart\tend\tassembly_name\tcoord_range\n'
      : ''

  const fileContents = bookmarkedRegions
    .map(b => {
      if (fileFormat === 'BED') {
        return `${b.refName}\t${b.start}\t${b.end}\n`
      } else {
        const locString = `${b.refName}:${b.start}..${b.end}`
        return `${b.refName}\t${b.start}\t${b.end}\t${b.assemblyName}\t${locString}\n`
      }
    })
    .reduce((a, b) => a + b, fileHeader)

  const blob = new Blob([fileContents || ''], {
    type:
      fileFormat === 'BED'
        ? 'text/x-bed;charset=utf-8'
        : 'text/tab-separated-values;charset=utf-8',
  })

  saveAs(blob, `jbrowse_bookmarks.${fileFormat === 'BED' ? 'bed' : 'tsv'}`)
}

const useStyles = makeStyles(() => ({
  closeDialog: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  dialogContainer: {
    margin: 15,
  },
  downloadButton: {
    marginBottom: 5,
  },
  flexItem: {
    margin: 5,
  },
  flexContainer: {
    display: 'flex',
    justifyContent: 'space-evenly',
    width: 200,
  },
}))

function DownloadBookmarks({ model }: { model: GridBookmarkModel }) {
  const classes = useStyles()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [fileType, setFileType] = useState('BED')

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFileType(event.target.value as string)
  }

  // @ts-ignore
  const { bookmarkedRegions } = getSession(model)

  return (
    <>
      <Button
        className={classes.downloadButton}
        startIcon={<GetAppIcon />}
        onClick={() => setDialogOpen(true)}
      >
        Download
      </Button>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          <IconButton
            className={classes.closeDialog}
            aria-label="close-dialog"
            onClick={() => setDialogOpen(false)}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <div className={classes.dialogContainer}>
          <>
            <div className={classes.flexContainer}>
              <Select
                className={classes.flexItem}
                data-testid="selectFileType"
                value={fileType}
                onChange={handleChange}
              >
                <MenuItem value="BED">BED</MenuItem>
                <MenuItem value="TSV">TSV</MenuItem>
              </Select>
              <Button
                className={classes.flexItem}
                data-testid="dialogDownload"
                variant="contained"
                color="primary"
                startIcon={<GetAppIcon />}
                onClick={() => {
                  downloadBookmarkFile(bookmarkedRegions, fileType)
                  setDialogOpen(false)
                }}
              >
                Download
              </Button>
            </div>
          </>
        </div>
      </Dialog>
    </>
  )
}

export default observer(DownloadBookmarks)
