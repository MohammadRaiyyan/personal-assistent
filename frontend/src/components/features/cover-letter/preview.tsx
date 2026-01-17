import MDEditor from '@uiw/react-md-editor'

const Preview = ({ content }) => {
  return (
    <div className="py-4">
      <MDEditor value={content} preview="preview" height={700} />
    </div>
  )
}

export default Preview
