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
    this.onUpload = this.onUpload.bind(this)
    this.uppy.addUploader(this.onUpload)
  }

  onUpload (fileIDs) {
    const file = this.uppy.getFile(fileIDs[0])
    const fileReader = new window.FileReader()

    fileReader.onloadend = async e => {
      try {
        const response = await callApi('files', 'post', {
          data: e.currentTarget.result,
          filename: file.name
        })

        if (this.props.onFileUploaded) {
          this.props.onFileUploaded(response.imageUrl, response.sizeVariants)
        }
      }
      catch (error) {
        message.error('An error occured uploading file: ' + error.status + ' ' + error.statusText)
      }
    }

    fileReader.readAsBinaryString(file.data)
  }

  render () {
    const up = (process.env.NODE_ENV !== 'test') &&
      <div onChange={this.handleChange}>
        <Dashboard uppy={this.uppy} inline width='100%' height={200} proudlyDisplayPoweredByUppy={false} hideUploadButton />
      </div>
    return up
  }
}

FileUpload.PropTypes = {
  maxNumberOfFiles: PropTypes.number,
  allowedFileTypes: PropTypes.arrayOf(PropTypes.string),
  onFileUploaded: PropTypes.func
}

export default FileUpload
