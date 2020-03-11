import { message } from 'antd'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import callApi from '../../lib/callApi'
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'
import styled from 'styled-components'

const { Dashboard } = require('@uppy/react')
const Uppy = require('@uppy/core')

const UploadingBadge = styled.div`
  display: none;
  position: absolute;
  right: 0;
  top: 0;
  transition: top 0.2s ease-in;
  background: #6549aa;
  padding: 8px 10px;
  border-radius: 4px;
  color: white;
  font-size: smaller;
  line-height: normal;

  @keyframes uploading
  {
    from
    {
      top: 0;
    }
    to
    {
      top: -35px;
    }
  }

  &[data-uploading]
  {
    display: block;
    animation: uploading 0.2s forwards;
  }
`
const FileUploadWrapper = styled.div`
  position: relative;
`

class FileUpload extends Component {
  TWO_MEGABYTES = 2000000

  constructor (props) {
    super(props)

    this.uploading = []

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

    this.state = {
      uploading: false
    }
  }
  
  componentDidMount() {
    let previousUploading = false
    this.uploadingTimerId = window.setInterval(() => {
      const uploading = this.uploading.length > 0 && this.uploading.find(upload => !upload.complete)

      if (uploading !== previousUploading) {
        this.setState({
          uploading
        })
        previousUploading = uploading

        if (this.props.onUploadingStatusChanged) {
          this.props.onUploadingStatusChanged(uploading)
        }
      }
    }, 250)
  }
  componentWillUnmount() {
    window.clearInterval(this.uploadingTimerId)
  }

  uploadFile (event) {
    const fileReader = new window.FileReader()

    fileReader.onloadend = async e => {
      try {
        const responsePromise = callApi('files', 'post', {
          data: e.currentTarget.result,
          filename: event.name
        })

        const upload = {
          responsePromise,
          complete: false
        }

        this.uploading.push(upload)

        const response = await responsePromise
        upload.complete = true
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
      <FileUploadWrapper>
        <UploadingBadge data-uploading={this.state.uploading ? true : undefined}>Uploading...</UploadingBadge>
        <Dashboard uppy={this.uppy} inline width='100%' height={200} proudlyDisplayPoweredByUppy={false} hideUploadButton />
      </FileUploadWrapper>
    return up
  }
}

FileUpload.PropTypes = {
  maxNumberOfFiles: PropTypes.number,
  allowedFileTypes: PropTypes.arrayOf(PropTypes.string),
  onFilesChanged: PropTypes.func,
  onUploadingStatusChanged: PropTypes.func
}

export default FileUpload
