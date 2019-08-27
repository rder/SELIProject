import React, { Component } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import FormHelperText from '@material-ui/core/FormHelperText';
import AccessibilityIcon from '@material-ui/icons/Accessibility';
import LiveHelpIcon from '@material-ui/icons/LiveHelp';
import InfoIcon from '@material-ui/icons/Info';

import Help from './Help';
import Decision from './DecisionHelpStepper';

const useStyles = makeStyles(theme => ({
   iconButton:{
    verticalAlign:'baseline',
    padding: 0,
  }
}));

/*
  error: boolan --> if there's error on accessibility validation
  id: string --> id of form component
  tip: string --> small help presented inline
  step: [hp5Helper || textHelper|| imagePurposeHelper_info|| imagePurposeHelper_deco|| imagePurposeHelper_txt|| imagePurposeHelper_cplx|| imageAltHelper_info|| imageAltHelper_txt|| imageAltHelper ] --> help with i,age examples presented as popover
  guide: [imgPurposeCond]

 */
export default function AccessibilityHelp(props) {
    const classes = useStyles();
    
    return(
      <React.Fragment>
        <FormHelperText role="note" id={props.name+"-input-helper-text"} error={props.err} component="span">
            {
              !props.error?
              <AccessibilityIcon 
                aria-label={props.error? "Accessibility fault" : "Passed accessibility validation"}
                className={props.error? "accessib-error" : "accessib-valid"}
              />
              :undefined 
            }
            <InfoIcon aria-label="Accessibilit tip"/>
            {props.tip}
            <br/>
            {
              props.step !== undefined?
               <Help helper={props.step} aria-label="Accessibilit tip" text={props.stepLabel} color="primary" buttonLabel="Mais detalhes"/>
              :
              undefined
            }
            {
              props.guide !== undefined?
              <Decision caller={props.name} buttonLabel="Help me decide" useStyle={classes.iconButton} ariaLabel="Accessibilit help" color="secondary"/> 
              :
              undefined
            }
        </FormHelperText>
      </React.Fragment>
    );
  }
