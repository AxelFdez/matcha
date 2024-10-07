// Checking e-mail string format
export const validateEmail = (value) => {

    return (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$/.test(value));
}
 
// Formating text: replacing newlines with <br> tags
export const replace_newLine_to_br_tags = (text) => {

    return text.replace(/\n/g, '<br>');
}