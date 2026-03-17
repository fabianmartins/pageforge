import React, { useState } from 'react';
import Form from '@cloudscape-design/components/form';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Select from '@cloudscape-design/components/select';
import Textarea from '@cloudscape-design/components/textarea';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Header from '@cloudscape-design/components/header';
import Container from '@cloudscape-design/components/container';
import type { PageConfig, FormLayout } from '../types.js';
import { useI18n } from '../i18n.js';

interface FormPageProps {
  config: PageConfig;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  loading?: boolean;
  initialData?: Record<string, any>;
}

export function FormPage({ config, onSubmit, onCancel, loading, initialData }: FormPageProps) {
  const { t } = useI18n();
  const layout = config.layout as FormLayout;
  const [formData, setFormData] = useState<Record<string, any>>(initialData ?? {});

  const setValue = (key: string, value: any) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  return (
    <Form
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          {onCancel && <Button variant="link" onClick={onCancel}>{t('form.cancel', 'Cancel')}</Button>}
          <Button variant="primary" loading={loading} onClick={() => onSubmit(formData)}>
            {layout.submitLabel ? t(layout.submitLabel, layout.submitLabel) : t('form.submit', 'Submit')}
          </Button>
        </SpaceBetween>
      }
      header={<Header description={layout.description ? t(layout.description, layout.description) : undefined}>{t(layout.title, layout.title)}</Header>}
    >
      <Container>
        <SpaceBetween size="l">
          {layout.fields.map(field => (
            <FormField key={field.key} label={t(field.label, field.label)} description={field.description ? t(field.description, field.description) : undefined}>
              {field.type === 'select' ? (
                <Select
                  selectedOption={
                    field.options?.find(o => o.value === formData[field.key]) ?? null
                  }
                  onChange={({ detail }) =>
                    setValue(field.key, detail.selectedOption.value)
                  }
                  options={(field.options ?? []).map(o => ({ ...o, label: t(o.label, o.label) }))}
                  placeholder={field.placeholder ? t(field.placeholder, field.placeholder) : undefined}
                />
              ) : field.type === 'textarea' ? (
                <Textarea
                  value={formData[field.key] ?? ''}
                  onChange={({ detail }) => setValue(field.key, detail.value)}
                  placeholder={field.placeholder ? t(field.placeholder, field.placeholder) : undefined}
                />
              ) : (
                <Input
                  value={formData[field.key] ?? ''}
                  onChange={({ detail }) => setValue(field.key, detail.value)}
                  placeholder={field.placeholder ? t(field.placeholder, field.placeholder) : undefined}
                  type={field.type === 'number' ? 'number' : 'text'}
                />
              )}
            </FormField>
          ))}
        </SpaceBetween>
      </Container>
    </Form>
  );
}
