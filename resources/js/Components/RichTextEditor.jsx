import React, { useEffect, useRef } from 'react';

export default function RichTextEditor({ value, onChange, onInit, placeholder = 'Write your thoughts here...' }) {
    const editorRef = useRef(null);
    const instanceRef = useRef(null);

    useEffect(() => {
        if (editorRef.current && window.ClassicEditor) {
            window.ClassicEditor.create(editorRef.current, {
                placeholder: placeholder,
                toolbar: [
                    'heading', '|', 
                    'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|',
                    'blockQuote', 'insertTable', 'mediaEmbed', '|',
                    'undo', 'redo'
                ]
            })
            .then(editor => {
                instanceRef.current = editor;
                if (onInit) onInit(editor);
                
                // Set initial value
                editor.setData(value || '');

                // Listen to changes
                editor.model.document.on('change:data', () => {
                    const data = editor.getData();
                    onChange(data);
                });
            })
            .catch(error => {
                console.error('Error initializing CKEditor:', error);
            });
        }

        // Cleanup on unmount
        return () => {
            if (instanceRef.current) {
                instanceRef.current.destroy()
                    .then(() => {
                        instanceRef.current = null;
                    })
                    .catch(err => console.error('Error destroying CKEditor:', err));
            }
        };
    }, []);

    // Sync value from outside if it changes programmatically, but avoid cursor jumps
    useEffect(() => {
        if (instanceRef.current && value !== undefined) {
            const currentData = instanceRef.current.getData();
            if (currentData !== value) {
                instanceRef.current.setData(value || '');
            }
        }
    }, [value]);

    return (
        <div className="ckeditor-custom-wrapper mt-1">
            <textarea ref={editorRef} style={{ display: 'none' }} />
            
            {/* Custom CSS overrides to style CKEditor to match our dynamic corporate themes! */}
            <style dangerouslySetInnerHTML={{ __html: `
                .ck-editor__editable_inline {
                    min-height: 320px;
                    border-bottom-left-radius: 12px !important;
                    border-bottom-right-radius: 12px !important;
                    background-color: var(--bg-main) !important;
                    color: var(--text-main) !important;
                    border-color: rgba(var(--border-color), 0.6) !important;
                    padding: 1.25rem 1.5rem !important;
                    font-family: 'Inter', sans-serif !important;
                    font-size: 0.95rem !important;
                    line-height: 1.7 !important;
                }
                .ck-editor__editable_inline:focus {
                    border-color: var(--color-primary) !important;
                    outline: none !important;
                    box-shadow: 0 0 0 1px var(--color-primary) !important;
                }
                .ck-toolbar {
                    border-top-left-radius: 12px !important;
                    border-top-right-radius: 12px !important;
                    background-color: var(--bg-card) !important;
                    border-color: rgba(var(--border-color), 0.6) !important;
                }
                .ck-button {
                    color: var(--text-main) !important;
                    cursor: pointer !important;
                }
                .ck-button:hover {
                    background-color: rgba(var(--text-main), 0.1) !important;
                }
                .ck-button.ck-on {
                    background-color: rgba(var(--text-main), 0.15) !important;
                    color: var(--color-primary) !important;
                }
                .ck-dropdown__panel {
                    background-color: var(--bg-card) !important;
                    border-color: rgba(var(--border-color), 0.6) !important;
                }
                .ck-editor__editable blockquote {
                    border-left: 4px solid var(--color-primary) !important;
                    background-color: rgba(var(--text-main), 0.05) !important;
                    padding: 0.75rem 1.25rem !important;
                    margin: 1.25rem 0 !important;
                    font-style: italic !important;
                    color: var(--text-muted) !important;
                }
            `}} />
        </div>
    );
}
