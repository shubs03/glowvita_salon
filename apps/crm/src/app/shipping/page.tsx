'use client';

import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Switch, Radio, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useGetShippingConfigQuery, useUpdateShippingConfigMutation } from '../../../../packages/store/src/services/api';

const ShippingPage = () => {
  const [form] = Form.useForm();
  const { data: shippingConfig, isLoading, isError } = useGetShippingConfigQuery();
  const [updateShipping, { isLoading: isUpdating }] = useUpdateShippingConfigMutation();
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (shippingConfig) {
      form.setFieldsValue({
        chargeType: shippingConfig.chargeType || 'fixed',
        amount: shippingConfig.amount || 0,
      });
      setIsEnabled(shippingConfig.isEnabled || false);
    }
  }, [shippingConfig, form]);

  const handleSubmit = async (values) => {
    try {
      await updateShipping({
        ...values,
        isEnabled,
      }).unwrap();
      message.success('Shipping settings saved successfully');
    } catch (error) {
      console.error('Failed to save shipping settings:', error);
      message.error('Failed to save shipping settings');
    }
  };

  const handleToggle = (checked) => {
    setIsEnabled(checked);
  };

  return (
    <div className="p-4">
      <Card 
        title="Shipping Charges Configuration"
        extra={
          <div className="flex items-center">
            <span className="mr-2">Enable Shipping</span>
            <Switch 
              checked={isEnabled} 
              onChange={handleToggle}
              loading={isLoading}
            />
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            chargeType: 'fixed',
            amount: 0,
          }}
        >
          <Form.Item name="chargeType" label="Charge Type">
            <Radio.Group>
              <Radio value="fixed">Fixed Amount (₹)</Radio>
              <Radio value="percentage">Percentage (%)</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: 'Please enter the amount' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue('chargeType') === 'percentage' && value > 100) {
                    return Promise.reject('Percentage cannot be more than 100');
                  }
                  if (value < 0) {
                    return Promise.reject('Amount cannot be negative');
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input 
              type="number" 
              min={0}
              max={form.getFieldValue('chargeType') === 'percentage' ? 100 : undefined}
              addonAfter={form.getFieldValue('chargeType') === 'percentage' ? '%' : '₹'}
              disabled={!isEnabled}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              loading={isUpdating}
              disabled={!isEnabled}
            >
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ShippingPage;
