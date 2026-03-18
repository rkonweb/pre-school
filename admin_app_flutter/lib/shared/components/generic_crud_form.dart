import 'package:flutter/material.dart';

enum FormFieldType { text, number, date, dropdown, toggle }

class FormFieldConfig {
  final String key;
  final String label;
  final FormFieldType type;
  final List<String>? options; // For dropdown
  final bool required;
  final String? initialValue;

  const FormFieldConfig({
    required this.key,
    required this.label,
    this.type = FormFieldType.text,
    this.options,
    this.required = false,
    this.initialValue,
  });
}

class GenericCrudForm extends StatefulWidget {
  final String title;
  final List<FormFieldConfig> fields;
  final Map<String, dynamic>? initialData;
  final Function(Map<String, dynamic>) onSubmit;

  const GenericCrudForm({
    super.key,
    required this.title,
    required this.fields,
    this.initialData,
    required this.onSubmit,
  });

  @override
  State<GenericCrudForm> createState() => _GenericCrudFormState();
}

class _GenericCrudFormState extends State<GenericCrudForm> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, dynamic> _formData = {};

  @override
  void initState() {
    super.initState();
    for (var field in widget.fields) {
      _formData[field.key] = widget.initialData?[field.key] ?? field.initialValue;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title, style: const TextStyle(fontFamily: 'Cabinet Grotesk', fontWeight: FontWeight.w800)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: const Color(0xFF140E28),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            ...widget.fields.map((field) => _buildField(field)),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF140E28),
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 54),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: const Text('SAVE RECORD', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 0.5)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildField(FormFieldConfig config) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            config.label.toUpperCase(),
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w900,
              color: Color(0xFF7B7291),
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 8),
          _buildInput(config),
        ],
      ),
    );
  }

  Widget _buildInput(FormFieldConfig config) {
    switch (config.type) {
      case FormFieldType.dropdown:
        return DropdownButtonFormField<String>(
          initialValue: _formData[config.key],
          items: config.options?.map((opt) => DropdownMenuItem(value: opt, child: Text(opt))).toList(),
          onChanged: (val) => setState(() => _formData[config.key] = val),
          decoration: _inputDecoration(),
        );
      case FormFieldType.toggle:
        return SwitchListTile(
          title: Text(config.label),
          value: _formData[config.key] ?? false,
          onChanged: (val) => setState(() => _formData[config.key] = val),
        );
      case FormFieldType.date:
        return TextFormField(
          initialValue: _formData[config.key],
          readOnly: true,
          decoration: _inputDecoration(suffix: const Icon(Icons.calendar_today_rounded, size: 18)),
          onTap: () async {
            final picked = await showDatePicker(
              context: context,
              initialDate: DateTime.now(),
              firstDate: DateTime(2000),
              lastDate: DateTime(2100),
            );
            if (picked != null) {
              setState(() => _formData[config.key] = picked.toString().split(' ')[0]);
            }
          },
        );
      case FormFieldType.number:
        return TextFormField(
          initialValue: _formData[config.key]?.toString(),
          keyboardType: TextInputType.number,
          decoration: _inputDecoration(),
          onChanged: (val) => _formData[config.key] = val,
          validator: config.required ? (val) => val == null || val.isEmpty ? 'Required' : null : null,
        );
      case FormFieldType.text:
        return TextFormField(
          initialValue: _formData[config.key],
          decoration: _inputDecoration(),
          onChanged: (val) => _formData[config.key] = val,
          validator: config.required ? (val) => val == null || val.isEmpty ? 'Required' : null : null,
        );
    }
  }

  InputDecoration _inputDecoration({Widget? suffix}) {
    return InputDecoration(
      filled: true,
      fillColor: const Color(0xFFF1F5F9),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
      suffixIcon: suffix,
    );
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      widget.onSubmit(_formData);
    }
  }
}
