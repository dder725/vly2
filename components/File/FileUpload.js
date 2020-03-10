import { message } from 'antd'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import callApi from '../../lib/callApi'
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'

const { Dashboard } = require('@uppy/react')
const Uppy = require('@uppy/core')

class FileUpload extends Component {
  TWO_MEGABYTES = 2000000

  constructor (props) {
    super(props)

    // Map the uppy filename to the s3 bucket URL (once uploaded)
    this.filenameToLocationUrlMap = new Map()

    this.uppy = Uppy({
      id: 'uppy',
      autoProceed: true,
      debug: false,
      formData: true,
      restrictions: {
        maxFileSize: this.TWO_MEGABYTES,
        maxNumberOfFiles: props.maxNumberOfFiles,
        minNumberOfFiles: 0,
        allowedFileTypes: props.allowedFileTypes
      },
      meta: {}
    })

    if (props.files) {
      for (const file of props.files) {
        this.uppy.addFile({
          name: file.filename,
          data: {
            name: file.filename
          }
        })

        this.filenameToLocationUrlMap.set(file.filename, file.location)
      }
    }

    this.uppy.on('file-added', this.uploadFile.bind(this))
    this.uppy.on('file-removed', () => this.raiseFilesChanged())
  }

  uploadFile (event) {
    const fileReader = new window.FileReader()

    fileReader.onloadend = async e => {
      try {
        const response = await callApi('files', 'post', {
          data: e.currentTarget.result,
          filename: event.name
        })

        this.filenameToLocationUrlMap.set(event.name, response.location)
        this.raiseFilesChanged()
      }
      catch (error) {
        console.error(error)
        message.error('An error occured uploading file')
      }
    }

    fileReader.readAsBinaryString(event.data)
  }

  raiseFilesChanged() {
    if (this.props.onFilesChanged) {
      this.props.onFilesChanged(this.uppy.getFiles().map(file => ({
        ...file,
        location: this.filenameToLocationUrlMap.get(file.name)
      })))
    }
  }

  render () {
    const up = (process.env.NODE_ENV !== 'test') &&
      <Dashboard uppy={this.uppy} inline width='100%' height={200} proudlyDisplayPoweredByUppy={false} hideUploadButton />
    return up
  }
}

FileUpload.PropTypes = {
  maxNumberOfFiles: PropTypes.number,
  allowedFileTypes: PropTypes.arrayOf(PropTypes.string),
  onFilesChanged: PropTypes.func,
}

export default FileUpload
