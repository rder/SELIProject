/* Intent of Success Criterion B.2.2.1:

	The intent of this success criterion is to help ensure that accessible authoring practices are part of the default workflow of authoring tools. This requirement applies when the authoring outcome is predictable by the authoring tool. For example, a generic "insert table" command would not be applicable, despite the fact that an author might misuse it for layout, because the author might be seeking the outcome of adding tabular information. In contrast, a page layout editor is covered by the requirement because the purpose of the feature is to edit the page layout.


	Examples of Success Criterion B.2.2.1:
	Structural markup: A WYSIWYG HTML editor does not include any authoring action options that will necessarily result in web content that will not meet the WCAG 2.0 Level A success criteria. For example:
	a toolbar button that allows text to be marked as bold does so by adding a <strong> element rather than a <span> element with a bold style.
	a the toolbar button for placing text into a bulleted list does so with list markup (e.g. <ul> and <li> elements) rather than a <span> element-based implementation.
	a page layout view makes use of CSS positioning rather than table markup.
	De-emphasizing problematic options: A WYSIWYG editing-view emphasizes more accessible choices with a higher position in the menus and a position in user interface shortcuts, such as toolbars. Choices that always lead to less accessible web content are de-emphasized with lower menu positions.

 */

/* Intent of Success Criterion B.2.3.1:
	The intent of this success criterion is to ensure that authors can add alternative content for non-text content and modify that alternative content in the future.

	If the type of alternative content (e.g. alternative text) is not typically displayed on screen by user agents, then WYSIWYG editing-views may not display it. This is acceptable as long as another mechanism is provided for modifying that alternative content (e.g. an "Image Properties" dialog).

	Examples of Success Criterion B.2.3.1:
	Properties dialog: In a WYSIWYG editing-view, alternative content is not displayed, since the editing-view is designed to mimic typical user agents. However, the alternative content can be accessed and edited via a properties editor that displays the properties for the content that currently has focus.
 */
import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';

import {Editor, EditorState, RichUtils, convertToRaw, convertFromRaw} from 'draft-js';
import { stateToHTML } from "draft-js-export-html";

import Button from '@material-ui/core/Button';
// import ButtonGroup from '@material-ui/core/ButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';

import FormatAlignLeftIcon from '@material-ui/icons/FormatAlignLeft';
import FormatAlignCenterIcon from '@material-ui/icons/FormatAlignCenter';
import FormatAlignRightIcon from '@material-ui/icons/FormatAlignRight';
import FormatAlignJustifyIcon from '@material-ui/icons/FormatAlignJustify';
import FormatBoldIcon from '@material-ui/icons/FormatBold';
import FormatItalicIcon from '@material-ui/icons/FormatItalic';
import FormatUnderlinedIcon from '@material-ui/icons/FormatUnderlined';
import FormatColorFillIcon from '@material-ui/icons/FormatColorFill';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

///////////////////////////////////////////////////////////////////////////////
// props {                                                                   //
// 	onChange (fn),                                                           //
// 	handleerror (fn),                                                        //
// 	error (bool),                                                            //
// 	editorData (string): name to retrieve data from localStorage             //
// 	id (string): id of component                                             //
// 	label (string): label for component                                      //
// 	placeholder (string): placeholder for field                              //
// 	required (boolean): if its a mandatory field                             //
// 	ariaLabelledBy (string): id of alternative label component               //
// 	ariaDescribedBy (string): id of component with description of this field //
// }                                                                         //
///////////////////////////////////////////////////////////////////////////////
export default function ImageCaptionEditor(props) {
	const [editorState, setEditorState] = React.useState(
		EditorState.createEmpty()
	);
	const [classNameEditor, setClassNameEditor] = React.useState('ImgCaptionEditor-editor');
	const [classNameLabel, setClassNameLabel] = React.useState('ImgCaptionEditor-label');
	const [classNameAsterisk, setClassNameAsterisk] = React.useState('ImgCaptionEditor-asterisk');
	
	const [alignment, setAlignment] = React.useState('left');//todo
	const [blockTypes, setBlockTypes] = React.useState('paragraph');
	const [textSyles, setTextStyles] = React.useState(() => []);
	const [outputHtml, setOutputHtml] = React.useState('');
	const [outputRaw, setOutputRaw] = React.useState('');

	const initialRaw =  () => {localStorage.getItem(props.editorData) || '';}; //a function to only read localstorage at first render
	const [inputRaw, setInputRaw] = React.useState(initialRaw);
	const [validationError, setValidationError] = React.useState(props.error);
	const editor = React.useRef(null);

	useEffect(() => {
		let currentContent = editorState.getCurrentContent();
					
		// setBlockTypes(getActiveBlockType());
		
		setOutputHtml(stateToHTML(currentContent));
		
		let raw = convertToRaw(currentContent);
		setOutputRaw(raw);
		localStorage.setItem('editorData', JSON.stringify(raw));

		let err = validationError;
		if(props.handleerror !== undefined){
			err = props.handleerror(currentContent.getPlainText('\u0001'));
		}

		//const txt = blocks.map(block => (!block.text.trim() && '\n') || block.text).join('\n');
		if(props.onChange !== undefined)
			props.onChange(currentContent.getPlainText('\u0001'));
		setValidationError(err);

		updateClass(currentContent, err);

	},[editorState]);

	function updateClass(currentContent, validation){
		let classEditor = 'ImgCaptionEditor-editor';
		let classNameLabel = 'ImgCaptionEditor-label';
		let classNameAsterisk = 'ImgCaptionEditor-asterisk';
		let showPlaceholder = false;
		let showLabelInside = true;
		let showFocus = false;
		
		if(validation)
		{
			classEditor += ' ImgCaptionEditor-error';
			classNameLabel += ' ImgCaptionEditor-labelError';
			setClassNameAsterisk(classNameAsterisk + ' ImgCaptionEditor-labelError');
		}

		if(editorState.getSelection().hasFocus){
			showPlaceholder = true;
			showLabelInside = false;
			showFocus = true;
		}
		else
		{
			showLabelInside = true;
			showPlaceholder = false;
			showFocus = false;
		}

		if (currentContent.hasText()) {
			showLabelInside = false;
			showPlaceholder = false;
		}
		else{ 
			if (currentContent.getBlockMap().first().getType() !== 'unstyled') { 
				showPlaceholder = false;
			}
		}

		classNameLabel +=  (showLabelInside? '' :' ImgCaptionEditor-labelShrink');
		classEditor += (showPlaceholder? '':' ImgCaptionEditor-hidePlaceholder'); 
		classEditor += (showFocus? ' ImgCaptionEditor-focused' : ''); 
		classNameLabel += (showFocus? ' ImgCaptionEditor-labelFocused' : ''); 


		setClassNameEditor(classEditor);
		setClassNameLabel(classNameLabel);
	}
	function getActiveBlockType(){
		const selection = editorState.getSelection();
		return editorState
			.getCurrentContent()
			.getBlockForKey(selection.getStartKey())
			.getType();
	}

	function toogleInlineStyle(inlineStyle){
		setTextStyles(inlineStyle);
		onChange(RichUtils.toggleInlineStyle(editorState,inlineStyle));
	}

	function toggleBlockType(type){
		let prevType = getActiveBlockType();
		type = prevType === type? "paragraph" : type;
		setBlockTypes(type);
		onChange(RichUtils.toggleBlockType(editorState,type));
	}

	function renderContentAsRawJs() {
		return JSON.stringify(outputRaw, null, 2);
	}

	function focusEditor() {
		editor.current.focus();
	}

	/* Event handlres */
	const handleKeyCommand = (command) => {
		const newState = RichUtils.handleKeyCommand(editorState, command);
		if (newState) {
			setEditorState(newState); //this.onChange(newState);
			return 'handled';
		}
		return 'not-handled';
	};

	const onTab = (event) => {
		const maxDepth = 4;
		onChange(RichUtils.onTab(event, editorState, maxDepth));
	};

	const onClick = () => {
		focusEditor();
	};

	const onChange = (newEditorState) => {
		setEditorState(newEditorState);
	};

	return (
		<Grid item>

			<Grid container direction='column' justify='flex-start' alignments='flex-start'spacing={0}
				className="ImgCaptionEditor-root">
				<Grid item  xl={3} id="editor-control-block-types" value={blockTypes} className="ImgCaptionEditor-controls">
					<ToggleButton
						value='paragraph' 
						key="paragraph" 
						aria-label="Paragraph" 
						onClick={(e) => {
							e.preventDefault();
							toggleBlockType("paragraph");}}
						className={"ImgCaptionEditor-styleButton "+( blockTypes === "paragraph"? "ImgCaptionEditor-activeButton" : "")}>
						P
					</ToggleButton>	 
					<ToggleButton 
						value='header-one' 
						key='header-one'  
						aria-label="Header One" 
						onClick={(e)=>{
							e.preventDefault();
							toggleBlockType('header-one');}} 
						className={"ImgCaptionEditor-styleButton "+( blockTypes === "header-one"? "ImgCaptionEditor-activeButton" : "")}>
						H1
					</ToggleButton>	 
					<ToggleButton 
						value='header-two' 
						key='header-two'  
						aria-label="Header two" 
						onClick={(e)=>{
							e.preventDefault();
							toggleBlockType('header-two');}} 
						className={"ImgCaptionEditor-styleButton "+( blockTypes === "header-two"? "ImgCaptionEditor-activeButton" : "")}>
						H2
					</ToggleButton>	 
					<ToggleButton 
						value='header-three' 
						key='header-three'  
						aria-label="Header three" 
						onClick={(e)=>{
							e.preventDefault();
							toggleBlockType('header-three');}} 
						className={"ImgCaptionEditor-styleButton "+( blockTypes === "header-three"? "ImgCaptionEditor-activeButton" : "")}>
						H3
					</ToggleButton>	 
					<ToggleButton 
						value='header-four' 
						key='header-four'  
						aria-label="Header four" 
						onClick={(e)=>{
							e.preventDefault();
							toggleBlockType('header-four');}} 
						className={"ImgCaptionEditor-styleButton "+( blockTypes === "header-four"? "ImgCaptionEditor-activeButton" : "")}>
						H4
					</ToggleButton>	 
					<ToggleButton 
						value='header-five' 
						key='header-five'  
						aria-label="Header five" 
						onClick={(e)=>{
							e.preventDefault();
							toggleBlockType('header-five');}} 
						className={"ImgCaptionEditor-styleButton "+( blockTypes === "header-five"? "ImgCaptionEditor-activeButton" : "")}>
						H5
					</ToggleButton>	 
					<ToggleButton 
						value='header-six' 
						key='header-six'  
						aria-label="Header six" 
						onClick={(e)=>{
							e.preventDefault();
							toggleBlockType('header-six');}} 
						className={"ImgCaptionEditor-styleButton "+( blockTypes === "header-six"? "ImgCaptionEditor-activeButton" : "")}>
						H6
					</ToggleButton>	 
					<ToggleButton 
						value='unordered-list-item' 
						key='unordered-list-item'  
						aria-label="Unordered List" 
						onClick={(e)=>{
							e.preventDefault();
							toggleBlockType('unordered-list-item');}} 
						className={"ImgCaptionEditor-styleButton "+( blockTypes === "unordered-list-item"? "ImgCaptionEditor-activeButton" : "")}>
						UL
					</ToggleButton>	 
					<ToggleButton 
						value='ordered-list-item' 
						key='ordered-list-item'  
						aria-label="Ordered List" 
						onClick={(e)=>{
							e.preventDefault();
							toggleBlockType('ordered-list-item');}} 
						className={"ImgCaptionEditor-styleButton "+( blockTypes === "ordered-list-item"? "ImgCaptionEditor-activeButton" : "")}>
						OL
					</ToggleButton>	 
					<ToggleButton 
						value='blockquote' 
						key='blockquote'  
						aria-label="Quote" 
						onClick={(e)=>{
							e.preventDefault();
							toggleBlockType('blockquote');}} 
						className={"ImgCaptionEditor-styleButton "+( blockTypes === "blockquote"? "ImgCaptionEditor-activeButton" : "")}>
						Quote
					</ToggleButton>	 
				</Grid>
				<Grid item  xl={3} id="editor-control-inline-styles" value={textSyles} className="ImgCaptionEditor-controls">
					<ToggleButton 
						value='BOLD' 
						key="BOLD" 
						aria-label="Bold" 
						onClick={(e)=>{
							e.preventDefault();
							toogleInlineStyle('BOLD');}} 
						className={"ImgCaptionEditor-styleButton "+( editorState.getCurrentInlineStyle().has('BOLD')? 'ImgCaptionEditor-activeButton' : '')}>
						B
					</ToggleButton>	 
					<ToggleButton 
						value='ITALIC' 
						key="ITALIC" 
						aria-label="Italic" 
						onClick={(e)=>{
							e.preventDefault();
							toogleInlineStyle('ITALIC');}} 
						className={"ImgCaptionEditor-styleButton "+( editorState.getCurrentInlineStyle().has('ITALIC')? 'ImgCaptionEditor-activeButton' : '')}>
						I
					</ToggleButton>	 
					<ToggleButton 
						value='UNDERLINE' 
						key="UNDERLINE" 
						aria-label="Underline" 
						onClick={(e)=>{
							e.preventDefault();
							toogleInlineStyle('UNDERLINE');}} 
						className={"ImgCaptionEditor-styleButton "+( editorState.getCurrentInlineStyle().has('UNDERLINE')? 'ImgCaptionEditor-activeButton' : '')}>
						U
					</ToggleButton>	 
				</Grid>
				<Grid item  xl={3} className={classNameEditor}>
					<label className={classNameLabel} data-shrink="false" htmlFor={props.id + "-Editor"}>{props.label}
						{
							props.required &&
							<span className={classNameAsterisk}>&thinsp;*</span>
						}
					</label>
					<Editor
						id={props.id + "-Editor"}
						editorKey={props.id+"-Editor"}
						editorState={editorState}
						onChange={onChange}
						onClick={onClick}
						handleKeyCommand={handleKeyCommand}
						onTab={onTab}
						ariaMultiline={true}
						ariaLabelledBy={props.ariaLabelledBy}
						ariaDescribedBy={props.ariaDescribedBy}
						placeholder={props.placeholder}
						ref={editor}
						error={props.error}
					/>
				</Grid>
			</Grid>
			{/* for test*/}
			<Grid container spacing={1} direction="row" justify="flex-start" className="hide">
				<Grid item lg={2}>
					<pre>
						{outputHtml}
					</pre>
				</Grid>
				<Grid item lg={2}>
					<pre>
						{renderContentAsRawJs()}
					</pre>
				</Grid>
			</Grid>
		</Grid>
	);
}
  
  const styleMap = {
    CODE: {
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
      fontSize: 16,
      padding: 2,
    },
  };

  function getBlockStyle(block) {
    switch (block.getType()) {
      case 'blockquote': return 'RichEditor-blockquote';
      default: return null;
    }
  }

	function StyleButton (props){
    const onStToggle = (e) => {
      e.preventDefault();
      props.onToggle(props.style);
    };
    
	  let className = 'RichEditor-styleButton';
	  if (props.active) {
	    className += ' RichEditor-activeButton';
	  }
	  return (
	  	 <ToggleButton 
		    	value={props.style}  
		    	onClick={onStToggle}
					key={props.style}
					className={className}
					aria-label={props.label}
					tabIndex={0}
					>
					{props.label}	
				</ToggleButton>
	  );
  }

	var BLOCK_TYPES = [
		{label: 'P', style: 'paragraph'},
		{label: 'H1', style: 'header-one'},
		{label: 'H2', style: 'header-two'},
		{label: 'H3', style: 'header-three'},
		{label: 'H4', style: 'header-four'},
		{label: 'H5', style: 'header-five'},
		{label: 'H6', style: 'header-six'},
		{label: 'UL', style: 'unordered-list-item'},
		{label: 'OL', style: 'ordered-list-item'},
		{label: 'Quote', style: 'blockquote'},
		{label: 'Code', style: 'code-block'},
		{label: 'Atomic', style: 'atomic'},
	];

  const BlockStyleControls = (props) => {
    const selection = editorState.getSelection();
    const blockType = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();

    return (
      <div className="RichEditor-controls">
			<div id="editor-control-block-types" value={blockTypes} exclusive>
        {BLOCK_TYPES.map((type) =>
          <StyleButton
            key={type.label}
            active={type.style === blockType}
            label={type.label}
            onToggle={props.onToggle}
            style={type.style}
          />
        )}
			</div>
      </div>
    );
  };


	var INLINE_STYLES = [
		{label: 'Bold', style: 'BOLD'},
		{label: 'Italic', style: 'ITALIC'},
		{label: 'Underline', style: 'UNDERLINE'},
		{label: 'Monospace', style: 'CODE'},
	];

	const InlineStyleControls = (props) => {
	  var currentStyle = editorState.getCurrentInlineStyle();
	  return (
	    <div className="RichEditor-controls">
			<div id="editor-control-inline-styles" value={textSyles}>
	      {INLINE_STYLES.map(type =>
	        <StyleButton
	          key={type.label}
	          active={currentStyle.has(type.style)}
	          label={type.label}
	          onToggle={props.onToggle}
	          style={type.style}
	        />
	      )}
			</div>
	    </div>
	  );
	};
